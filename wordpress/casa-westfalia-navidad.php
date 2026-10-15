<?php
/**
 * Plugin Name:       Casa Westfalia · Navidades Selectas 2026
 * Description:       Landing del Catálogo de Navidad 2026 en /navidad/CW_Navidades-Selectas-2026.html. El formulario envía las solicitudes a marketing@cwestfalia.es con el correo de WordPress.
 * Version:           1.0.0
 * Requires at least: 5.6
 * Requires PHP:      7.4
 * Author:            Casa Westfalia
 * Text Domain:       cw-navidad
 *
 * El zip se genera con herramientas/plugin_wordpress.py: copia la web en landing/ con los
 * estilos y el código dentro de index.html y las rutas marcadas con %%CW_BASE%% y %%CW_ENDPOINT%%.
 */

defined( 'ABSPATH' ) || exit;

const CW_NAVIDAD_RUTA  = 'navidad/CW_Navidades-Selectas-2026.html';
const CW_NAVIDAD_EMAIL = 'marketing@cwestfalia.es';
const CW_NAVIDAD_LIMITE = 5; // Envíos por IP cada 10 minutos.

/* ---------- Dirección de la landing ---------- */

function cw_navidad_rewrite() {
	add_rewrite_rule( preg_quote( CW_NAVIDAD_RUTA, '#' ) . '$', 'index.php?cw_navidad=1', 'top' );
}
add_action( 'init', 'cw_navidad_rewrite' );

add_filter( 'query_vars', function ( $vars ) {
	$vars[] = 'cw_navidad';
	return $vars;
} );

register_activation_hook( __FILE__, function () {
	cw_navidad_rewrite();
	flush_rewrite_rules();
} );
register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );

/* ---------- Página: se sirve tal cual, sin la cabecera ni los estilos del tema ---------- */

add_action( 'template_redirect', function () {
	if ( ! get_query_var( 'cw_navidad' ) ) {
		return;
	}
	$html = file_get_contents( plugin_dir_path( __FILE__ ) . 'landing/index.html' );
	$html = str_replace(
		array( '%%CW_BASE%%', '%%CW_ENDPOINT%%' ),
		array(
			esc_url_raw( plugin_dir_url( __FILE__ ) . 'landing/' ),
			wp_json_encode( admin_url( 'admin-ajax.php?action=cw_navidad_contacto' ) ),
		),
		$html
	);
	status_header( 200 );
	header( 'Content-Type: text/html; charset=utf-8' );
	echo $html; // phpcs:ignore WordPress.Security.EscapeOutput -- página propia del plugin.
	exit;
}, 0 );

/* ---------- Formulario: envío directo a marketing@cwestfalia.es ---------- */

function cw_navidad_responde( $ok, $status, $error = '' ) {
	wp_send_json( $ok ? array( 'ok' => true ) : array( 'ok' => false, 'error' => $error ), $status );
}

function cw_navidad_contacto() {
	// phpcs:disable WordPress.Security.NonceVerification -- formulario público sin sesión.
	$campo = function ( $clave, $max = 200 ) {
		$valor = isset( $_POST[ $clave ] ) ? wp_unslash( $_POST[ $clave ] ) : '';
		return mb_substr( sanitize_text_field( (string) $valor ), 0, $max );
	};

	// Antispam: el campo "web" está oculto y solo lo rellenan los robots.
	if ( '' !== $campo( 'web' ) ) {
		cw_navidad_responde( true, 200 );
	}

	$ip    = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$clave = 'cw_navidad_' . md5( $ip );
	$envios = (int) get_transient( $clave );
	if ( $envios >= CW_NAVIDAD_LIMITE ) {
		cw_navidad_responde( false, 429, 'Demasiados envíos. Inténtelo más tarde.' );
	}

	$d = array(
		'canal'     => $campo( 'canal' ),
		'nombre'    => $campo( 'nombre' ),
		'empresa'   => $campo( 'empresa' ),
		'email'     => sanitize_email( $campo( 'email' ) ),
		'telefono'  => $campo( 'telefono' ),
		'provincia' => $campo( 'provincia' ),
		'mensaje'   => mb_substr( sanitize_textarea_field( isset( $_POST['mensaje'] ) ? (string) wp_unslash( $_POST['mensaje'] ) : '' ), 0, 3000 ),
	);
	$privacidad = $campo( 'privacidad' );
	// phpcs:enable

	if ( '' === $d['nombre'] || '' === $d['empresa'] || ! is_email( $d['email'] ) ) {
		cw_navidad_responde( false, 400, 'Faltan campos obligatorios o el email no es válido.' );
	}
	if ( 'on' !== $privacidad ) {
		cw_navidad_responde( false, 400, 'Debe aceptar la política de privacidad.' );
	}
	if ( ! in_array( $d['canal'], array( 'Retail', 'Horeca', 'Canal tradicional' ), true ) ) {
		$d['canal'] = 'Sin indicar';
	}

	$texto = implode( "\n", array(
		'Nueva solicitud desde la landing Navidades Selectas 2026',
		'',
		'Canal: ' . $d['canal'],
		'Nombre y apellidos: ' . $d['nombre'],
		'Empresa o establecimiento: ' . $d['empresa'],
		'Email: ' . $d['email'],
		'Teléfono: ' . ( $d['telefono'] ? $d['telefono'] : '-' ),
		'Provincia: ' . ( $d['provincia'] ? $d['provincia'] : '-' ),
		'',
		'Mensaje:',
		$d['mensaje'] ? $d['mensaje'] : '-',
		'',
		'Acepta la política de privacidad: Sí',
	) );

	$enviado = wp_mail(
		CW_NAVIDAD_EMAIL,
		'Solicitud Navidades Selectas 2026 · ' . $d['canal'] . ' · ' . $d['empresa'],
		$texto,
		array( 'Content-Type: text/plain; charset=UTF-8', 'Reply-To: ' . $d['email'] )
	);
	if ( ! $enviado ) {
		cw_navidad_responde( false, 500, 'No se ha podido enviar el correo.' );
	}
	set_transient( $clave, $envios + 1, 10 * MINUTE_IN_SECONDS );
	cw_navidad_responde( true, 200 );
}
add_action( 'wp_ajax_cw_navidad_contacto', 'cw_navidad_contacto' );
add_action( 'wp_ajax_nopriv_cw_navidad_contacto', 'cw_navidad_contacto' );

/* ---------- Enlace "Ver landing" en la lista de plugins ---------- */

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( $links ) {
	array_unshift( $links, '<a href="' . esc_url( home_url( CW_NAVIDAD_RUTA ) ) . '" target="_blank">Ver landing</a>' );
	return $links;
} );
