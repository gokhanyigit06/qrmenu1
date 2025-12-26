<?php
/**
 * Plugin Name: QR Menu Bridge
 * Plugin URI:  https://qrmenu1.vercel.app
 * Description: Embed your SaaS QR Menu easily into your WordPress site.
 * Version:     1.0.0
 * Author:      QR Menu Systems
 * License:     GPL-2.0+
 */

// Block direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class QR_Menu_Bridge {

    // UPDATE THIS WITH YOUR VERCEL APP URL
    const SAAS_URL = 'https://qrmenu1.vercel.app'; 

	public function __construct() {
		add_shortcode( 'qr-menu', array( $this, 'render_shortcode' ) );
        add_action('wp_footer', array($this, 'add_resizer_script'));
	}

	public function render_shortcode( $atts ) {
		$atts = shortcode_atts( array(
			'slug' => '', // Restaurant slug (e.g. 'mickeys')
            'width' => '100%',
		), $atts, 'qr-menu' );

		if ( empty( $atts['slug'] ) ) {
			return '<p style="color:red;">Lütfen kategori slug\'ını giriniz: [qr-menu slug="mickeys"]</p>';
		}

        $embed_url = self::SAAS_URL . '/' . esc_attr( $atts['slug'] ) . '/embed';

		ob_start();
		?>
		<div class="qr-menu-container" style="width: 100%; overflow: hidden;">
            <iframe 
                src="<?php echo esc_url( $embed_url ); ?>" 
                width="<?php echo esc_attr($atts['width']); ?>" 
                scrolling="no" 
                frameborder="0"
                class="qr-menu-iframe"
                style="border:none; width:100%; display:block; height: 600px; transition: height 0.3s ease;"
            ></iframe>
            
            <div style="text-align:center; margin-top:10px; font-size:12px; opacity:0.6;">
                <a href="<?php echo self::SAAS_URL; ?>" target="_blank" style="text-decoration:none; color:inherit;">
                    Powered by QR Menu
                </a>
            </div>
		</div>
		<?php
		return ob_get_clean();
	}

    public function add_resizer_script() {
        ?>
        <script>
        (function() {
            window.addEventListener('message', function(e) {
                // Security check: verify origin if needed
                // if (e.origin !== '<?php echo self::SAAS_URL; ?>') return;

                if (e.data && e.data.type === 'qr-menu-resize') {
                    var iframes = document.querySelectorAll('.qr-menu-iframe');
                    for (var i = 0; i < iframes.length; i++) {
                         // Find which iframe sent the message (simplified: assume single menu per page or update all)
                         // For stricter check, we can pass an ID.
                         // Here we simply update the height.
                         var newHeight = e.data.height;
                         if(newHeight > 0) {
                             iframes[i].style.height = (newHeight + 20) + 'px'; // +20 buffer
                         }
                    }
                }
            });
        })();
        </script>
        <?php
    }
}

new QR_Menu_Bridge();
