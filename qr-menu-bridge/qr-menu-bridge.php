<?php
/**
 * Plugin Name: QR Menu Bridge
 * Plugin URI:  https://qrmenu1-mu.vercel.app
 * Description: Embed your SaaS QR Menu easily into your WordPress site.
 * Version:     1.1.1
 * Author:      QR Menu Systems
 * License:     GPL-2.0+
 */

// Block direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class QR_Menu_Bridge {

    public function __construct() {
        // 1. Shortcode
		add_shortcode( 'qr-menu', array( $this, 'render_shortcode' ) );
        
        // 2. Footer Script (Resizer)
        add_action('wp_footer', array($this, 'add_resizer_script'));

        // 3. Admin Menu & Settings
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
	}

    // --- ADMIN SETTINGS ---
    public function add_admin_menu() {
        add_menu_page(
            'QR Menu Bridge Ayarları', // Page Title
            'QR Menu Bridge',          // Menu Title
            'manage_options',          // Capability
            'qr_menu_bridge',          // Menu Slug
            array($this, 'settings_page_html'), // Callback
            'dashicons-smartphone',    // Icon
            100                        // Position
        );
    }

    public function register_settings() {
        register_setting('qr_menu_bridge_options', 'qr_menu_saas_url');
        register_setting('qr_menu_bridge_options', 'qr_menu_default_slug');
    }

    public function settings_page_html() {
        ?>
        <div class="wrap">
            <h1>QR Menu Bridge Ayarları</h1>
            <form method="post" action="options.php">
                <?php settings_fields('qr_menu_bridge_options'); ?>
                <?php do_settings_sections('qr_menu_bridge_options'); ?>
                
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">SaaS Uygulama URL'i</th>
                        <td>
                            <input type="text" name="qr_menu_saas_url" value="<?php echo esc_attr(get_option('qr_menu_saas_url', 'https://qrmenu1-mu.vercel.app')); ?>" class="regular-text" style="width: 100%; max-width: 400px;" />
                            <p class="description">Örn: <code>https://qrmenu1-mu.vercel.app</code>. Sonunda / olmamalı.</p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Varsayılan Restoran Slug</th>
                        <td>
                            <input type="text" name="qr_menu_default_slug" value="<?php echo esc_attr(get_option('qr_menu_default_slug')); ?>" class="regular-text" />
                            <p class="description">Örn: <code>mickeys</code>. Shortcode'da belirtmezseniz bu slug kullanılır.</p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>

            <hr>
            <h3>Nasıl Kullanılır?</h3>
            <p>Bu ayarları kaydettikten sonra, WordPress sayfalarınızda şu kısa kodları kullanabilirsiniz:</p>
            <ul>
                <li><code>[qr-menu]</code> : Varsayılan Slug'ı kullanır.</li>
                <li><code>[qr-menu slug="sizin-restoran"]</code> : Belirtilen restoranı gösterir.</li>
            </ul>
        </div>
        <?php
    }

    // --- FRONTEND ---

	public function render_shortcode( $atts ) {
        $default_slug = get_option('qr_menu_default_slug', '');
        $saas_url = get_option('qr_menu_saas_url', 'https://qrmenu1-mu.vercel.app');

        // Remove trailing slash from URL if exists
        $saas_url = rtrim($saas_url, '/');

		$atts = shortcode_atts( array(
			'slug' => $default_slug, 
            'width' => '100%',
		), $atts, 'qr-menu' );

		if ( empty( $atts['slug'] ) ) {
			return '<div style="background:#fee; color:#c00; padding:10px; border:1px solid #c00; border-radius:4px;"><strong>QR Menu Hatası:</strong> Lütfen eklenti ayarlarından bir "Varsayılan Slug" girin veya shortcode içinde belirtin: <code>[qr-menu slug="ornek"]</code></div>';
		}

        // Construct Embed URL
        $embed_url = $saas_url . '/' . esc_attr( $atts['slug'] ) . '/embed';

		ob_start();
		?>
		<div class="qr-menu-container" style="width: 100%; overflow: hidden; position: relative; min-height: 200px;">
            <iframe 
                src="<?php echo esc_url( $embed_url ); ?>" 
                width="<?php echo esc_attr($atts['width']); ?>" 
                scrolling="no" 
                frameborder="0"
                class="qr-menu-iframe"
                style="border:none; width:100%; display:block; min-height: 600px; transition: height 0.3s ease; opacity: 0;"
                onload="this.style.opacity=1;"
            ></iframe>
            
            <noscript>
                <div style="padding: 20px; text-align: center;">
                    <a href="<?php echo esc_url($saas_url . '/' . $atts['slug']); ?>" target="_blank">Menüyü Görüntüle</a>
                </div>
            </noscript>
		</div>
		<?php
		return ob_get_clean();
	}

    public function add_resizer_script() {
        ?>
        <script>
        (function() {
            window.addEventListener('message', function(e) {
                if (e.data && e.data.type === 'qr-menu-resize') {
                    var iframes = document.querySelectorAll('.qr-menu-iframe');
                    for (var i = 0; i < iframes.length; i++) {
                         var newHeight = e.data.height;
                         if(newHeight > 0) {
                             iframes[i].style.height = (newHeight + 30) + 'px'; // Buffer
                             iframes[i].style.opacity = '1';
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
