(function($) {
	"use strict";
    
    var yoziWoo = {
        init: function(){
            var self = this;
            // login register
            self.loginRegister();
            // quickview
            self.quickviewInit();
            //detail
            self.productDetail();
            $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                self.loadImages();
            });
            
            // load image
            setTimeout(function(){
                self.loadImages();
            }, 300);

            // categories
            $('.widget_product_categories ul li.cat-item').each(function(){
                if ($(this).find('ul.children').length > 0) {
                    $(this).prepend('<i class="closed fa fa-angle-down"></i>');
                }
                $(this).find('ul.children').hide();
            });
            $( "body" ).on( "click", '.widget_product_categories ul li.cat-item .closed', function(){
                $(this).parent().find('ul.children').first().slideDown();
                $(this).removeClass('closed').removeClass('fa fa-angle-down').addClass('opened').addClass('fa fa-angle-up');
            });
            $( "body" ).on( "click", '.widget_product_categories ul li.cat-item .opened', function(){
                $(this).parent().find('ul.children').first().slideUp();
                $(this).removeClass('opened').removeClass('fa fa-angle-up').addClass('closed').addClass('fa fa-angle-down');
            });
            
            if ( yozi_woo_options.enable_search == '1') {
                self.searchProduct();
            }

            $('body').on('click', '.view-more-desc', function() {
               
                var $this = $(this); 
                var $content = $this.parent().find("div.woocommerce-product-details__short-description"); 
                
                if ( $this.hasClass('view-more') ) {
                    var linkText = yozi_woo_options.view_less_text;
                    $content.removeClass("hideContent").addClass("showContent");
                    $this.removeClass("view-more").addClass("view-less");
                } else {
                    var linkText = yozi_woo_options.view_more_text;
                    $content.removeClass("showContent").addClass("hideContent");
                    $this.removeClass("view-less").addClass("view-more");
                };

                $this.find('span').text(linkText);
            });
            
            // view more categories
            $('.widget_product_categories ul.product-categories').each(function(e){
                var height = $(this).outerHeight();
                if ( height > 260 ) {
                    var view_more = '<a href="javascript:void(0);" class="view-more-list-cat view-more"><span>'+yozi_woo_options.view_more_text+'</span> <i class="fa fa-angle-double-right"></i></a>';
                    $(this).parent().append(view_more);
                    $(this).addClass('hideContent');
                }
            });

            $('body').on('click', '.view-more-list-cat', function() {
               
                var $this = $(this); 
                var $content = $this.parent().find(".product-categories"); 
                
                if ( $this.hasClass('view-more') ) {
                    var linkText = yozi_woo_options.view_less_text;
                    $content.removeClass("hideContent").addClass("showContent");
                    $this.removeClass("view-more").addClass("view-less");
                } else {
                    var linkText = yozi_woo_options.view_more_text;
                    $content.removeClass("showContent").addClass("hideContent");
                    $this.removeClass("view-less").addClass("view-more");
                };

                $this.find('span').text(linkText);
            });

            // view more for filter
            $('.woocommerce-widget-layered-nav-list').each(function(e){
                var height = $(this).outerHeight();
                if ( height > 260 ) {
                    var view_more = '<a href="javascript:void(0);" class="view-more-list view-more"><span>'+yozi_woo_options.view_more_text+'</span> <i class="fa fa-angle-double-right"></i></a>';
                    $(this).parent().append(view_more);
                    $(this).addClass('hideContent');
                }
            });

            $('body').on('click', '.view-more-list', function() {
               
                var $this = $(this); 
                var $content = $this.parent().find(".woocommerce-widget-layered-nav-list"); 
                
                if ( $this.hasClass('view-more') ) {
                    var linkText = yozi_woo_options.view_less_text;
                    $content.removeClass("hideContent").addClass("showContent");
                    $this.removeClass("view-more").addClass("view-less");
                } else {
                    var linkText = yozi_woo_options.view_more_text;
                    $content.removeClass("showContent").addClass("hideContent");
                    $this.removeClass("view-less").addClass("view-more");
                };

                $this.find('span').text(linkText);
            });

            if ($('.details-product.layout-v3 .sticky-this').length > 0) {
                if ($(window).width() > 991) {
                    $('.details-product.layout-v3 .sticky-this').stick_in_parent({
                        parent: ".product-v-wrapper",
                        spacer: false
                    });
                }
            }
            
            self.initDokan();
        },
        initDokan: function(){
            var form = $('.dokan-seller-search-form');
            var xhr;
            var timer = null;

            form.on('keyup', '#search', function() {
                var self = $(this),
                    data = {
                        search_term: self.val(),
                        pagination_base: form.find('#pagination_base').val(),
                        per_row: '<?php echo esc_js($per_row); ?>',
                        action: 'dokan_seller_listing_search',
                        _wpnonce: form.find('#nonce').val()
                    };

                if (timer) {
                    clearTimeout(timer);
                }

                if ( xhr ) {
                    xhr.abort();
                }

                timer = setTimeout(function() {
                    form.find('.dokan-overlay').show();

                    xhr = $.post(dokan.ajaxurl, data, function(response) {
                        if (response.success) {
                            form.find('.dokan-overlay').hide();

                            var data = response.data;
                            $('#dokan-seller-listing-wrap').html( $(data).find( '.seller-listing-content' ) );
                        }
                    });
                }, 500);
            } );
            $('body').on('click', ".wrapper-dokan .btn-showserach-dokan", function(){
                $(".wrapper-dokan .dokan-seller-search-form").toggleClass('active');
            });
        },
        loginRegister: function(){
            $('body').on( 'click', '.register-login-action', function(e){
                e.preventDefault();
                var href = $(this).attr('href');
                setCookie('yozi_login_register', href, 0.5);
                $('.register_login_wrapper').removeClass('active');
                $(href).addClass('active');
            } );
        },
        searchProduct: function(){
            $('.apus-autocompleate-input').typeahead({
                    'hint': true,
                    'highlight': true,
                }, {
                    name: 'search',
                    source: function (query, processSync, processAsync) {
                        processSync([yozi_woo_options.empty_msg]);
                        $('.twitter-typeahead').addClass('loading');
                        return $.ajax({
                            url: yozi_woo_options.ajaxurl, 
                            type: 'GET',
                            data: {
                                's': query,
                                'category': $('.apus-search-form .dropdown_product_cat').val(),
                                'action': 'yozi_autocomplete_search',
                                'security': yozi_woo_options.ajax_nonce
                            },
                            dataType: 'json',
                            success: function (json) {
                                $('.twitter-typeahead').removeClass('loading');
                                return processAsync(json);
                            }
                        });
                    },
                    templates: {
                        empty : [
                            '<div class="empty-message">',
                            yozi_woo_options.empty_msg,
                            '</div>'
                        ].join('\n'),
                        suggestion: Handlebars.compile( yozi_woo_options.template )
                    },
                }
            );
            $('.apus-autocompleate-input').on('typeahead:selected', function (e, data) {
                e.preventDefault();
                setTimeout(function(){
                    $('.apus-autocompleate-input').val(data.title);    
                }, 5);
                
                return false;
            });
        },
        productDetail: function(){
            
            // review click link
            $('body').on('click', '.woocommerce-review-link', function(){
                $('html, body').animate({
                    scrollTop: $("#reviews").offset().top
                }, 1000);
                return false;
            });
        },
        quickviewInit: function(){
            $('body').on('click', 'a.quickview', function (e) {
                e.preventDefault();
                var self = $(this);
                self.parent().parent().parent().addClass('loading');
                var product_id = $(this).data('product_id');
                var url = yozi_woo_options.ajaxurl + '?action=yozi_quickview_product&product_id=' + product_id + '&security=' + yozi_woo_options.ajax_nonce;
                
                $.get(url,function(data,status){
                    $.magnificPopup.open({
                        mainClass: 'apus-mfp-zoom-in apus-quickview',
                        items : {
                            src : data,
                            type: 'inline'
                        }
                    });
                    // variation
                    if ( typeof wc_add_to_cart_variation_params !== 'undefined' ) {
                        $( '.variations_form' ).each( function() {
                            $( this ).wc_variation_form().find('.variations select:eq(0)').change();
                        });
                    }

                    var config = {
                        infinite: true,
                        arrows: false,
                        dots: true,
                        slidesToShow: 1,
                        slidesToScroll: 1
                    };
                    $(".quickview-slick").slick( config );

                    self.parent().parent().parent().removeClass('loading');
                });
            });
        },
        loadImages: function() {
            var self = this;
            $(window).off('scroll.unveil resize.unveil lookup.unveil');
            var $images = $('body').find('.product-image:not(.image-loaded) .unveil-image');
            
            if ($images.length) {
                $images.unveil(1, function() {
                    $(this).load(function() {
                        $(this).parents('.product-image').first().addClass('image-loaded');
                        $(this).removeAttr('data-src');
                        $(this).removeAttr('data-srcset');
                        $(this).removeAttr('data-sizes');
                    });
                });
            }
        }
    };

    yoziWoo.init();

    // accessories
    var yoziAccessories = {
        init: function() {
            var self = this;
            // check box click
            $('body').on('click', '.accessoriesproducts .accessory-add-product', function() {
                self.change_event();
            });
            // check all
            self.check_all_items();
            // add to cart
            self.add_to_cart();
        },
        add_to_cart: function() {
            var self = this;
            $('body').on('click', '.add-all-items-to-cart:not(.loading)', function(e){
                e.preventDefault();
                var self_this = $(this);
                self_this.addClass('loading');
                var all_product_ids = self.get_checked_product_ids();

                if( all_product_ids.length === 0 ) {
                    var msg = yozi_woo_options.empty;
                } else {
                    for (var i = 0; i < all_product_ids.length; i++ ) {
                        $.ajax({
                            type: "POST",
                            async: false,
                            url: yozi_ajax.ajaxurl,
                            data: {
                                'product_id': all_product_ids[i],
                                'action': 'woocommerce_add_to_cart',
                                'security': yozi_woo_options.ajax_nonce
                            },
                            success : function( response ) {
                                self.refresh_fragments( response );
                            }
                        });
                    }
                    var msg = yozi_woo_options.success;
                }
                $( '.yozi-wc-message' ).html(msg);
                self_this.removeClass('loading');
            });
        },
        change_event: function() {
            var self = this;
            $('.accessoriesproducts-wrapper').addClass('loading');
            var total_price = self.get_total_price();
            $.ajax({
                type: "POST",
                async: false,
                url: yozi_ajax.ajaxurl,
                data: { 'action': "yozi_get_total_price", 'data': total_price, 'security': yozi_woo_options.ajax_nonce  },
                success : function( response ) {
                    $( 'span.total-price .amount' ).html( response );
                    $( 'span.product-count' ).html( self.product_count() );

                    var product_ids = self.get_unchecked_product_ids();
                    $( '.accessoriesproducts .list-v2' ).each(function() {
                        $(this).parent().removeClass('is-disable');
                        for (var i = 0; i < product_ids.length; i++ ) {
                            if( $(this).hasClass( 'list-v2-'+product_ids[i] ) ) {
                                $(this).parent().addClass('is-disable');
                            }
                        }
                    });
                }
            });
            $('.accessoriesproducts-wrapper').removeClass('loading');
        },
        check_all_items: function() {
            var self = this;
            $('body').on('click', '.check-all-items', function(){
                $('.accessory-add-product:checkbox').not(this).prop('checked', this.checked);
                if ($(this).is(":checked")) {
                    $('.accessory-add-product:checkbox').prop('checked', true);  
                } else {
                    $('.accessory-add-product:checkbox').prop("checked", false);
                }

                self.change_event();
            });
        },
        // count product
        product_count: function(){
            var pcount = 0;
            $('.accessoriesproducts .accessory-add-product').each(function() {
                if ($(this).is(':checked')) {
                    pcount++;
                }
            });
            return pcount;
        },
        // get total price
        get_total_price: function(){
            var tprice = 0;
            $('.accessoriesproducts .accessory-add-product').each(function() {
                if( $(this).is(':checked') ) {
                    tprice += parseFloat( $(this).data( 'price' ) );
                }
            });
            return tprice;
        },
        // get checked product ids
        get_checked_product_ids: function(){
            var pids = [];
            $('.accessoriesproducts .accessory-add-product').each(function() {
                if( $(this).is(':checked') ) {
                    pids.push( $(this).data( 'id' ) );
                }
            });
            return pids;
        },
        // get unchecked product ids
        get_unchecked_product_ids: function(){
            var pids = [];
            $('.accessoriesproducts .accessory-add-product').each(function() {
                if( ! $(this).is(':checked') ) {
                    pids.push( $(this).data( 'id' ) );
                }
            });
            return pids;
        },
        refresh_fragments: function( response ){
            var frags = response.fragments;

            // Block fragments class
            if ( frags ) {
                $.each( frags, function( key ) {
                    $( key ).addClass( 'updating' );
                });
            }
            if ( frags ) {
                $.each( frags, function( key, value ) {
                    $( key ).replaceWith( value );
                });
            }
        }
    }
    yoziAccessories.init();



    var ApusProductGallery = function( $target, args ) {

        this.$target = $target;
        this.$images = $( '.woocommerce-product-gallery__image', $target );

        // No images? Abort.
        if ( 0 === this.$images.length ) {
            this.$target.css( 'opacity', 1 );
            return;
        }

        // Make this object available.
        $target.data( 'product_gallery', this );

        // Pick functionality to initialize...
        this.flexslider_enabled = $.isFunction( $.fn.flexslider ) && wc_single_product_params.flexslider_enabled;
        this.zoom_enabled       = $.isFunction( $.fn.zoom ) && wc_single_product_params.zoom_enabled;
        this.photoswipe_enabled = typeof PhotoSwipe !== 'undefined' && wc_single_product_params.photoswipe_enabled;

        // ...also taking args into account.
        if ( args ) {
            this.flexslider_enabled = false === args.flexslider_enabled ? false : this.flexslider_enabled;
            this.zoom_enabled       = false === args.zoom_enabled ? false : this.zoom_enabled;
            this.photoswipe_enabled = false === args.photoswipe_enabled ? false : this.photoswipe_enabled;
        }

        // ...and what is in the gallery.
        if ( 1 === this.$images.length ) {
            this.flexslider_enabled = false;
        }

        // Bind functions to this.
        this.initFlexslider       = this.initFlexslider.bind( this );
        this.initZoom             = this.initZoom.bind( this );
        this.initZoomForTarget    = this.initZoomForTarget.bind( this );
        this.initPhotoswipe       = this.initPhotoswipe.bind( this );

        this.getGalleryItems      = this.getGalleryItems.bind( this );
        this.openPhotoswipe       = this.openPhotoswipe.bind( this );

        if ( this.flexslider_enabled ) {
            this.initFlexslider();

        } else {
            this.$target.css( 'opacity', 1 );
        }

        if ( this.zoom_enabled ) {
            this.initZoom();
            $target.on( 'woocommerce_gallery_init_zoom', this.initZoom );
        }

        if ( this.photoswipe_enabled ) {
            this.initPhotoswipe();
        }
    };

    /**
     * Initialize flexSlider.
     */
    ApusProductGallery.prototype.initFlexslider = function() {
        var $target = this.$target,
            gallery = this;

        var slick_init = function(self) {
            self.each( function(){
                
                var config = {
                    infinite: false,
                    arrows: $(this).data( 'nav' ),
                    dots: $(this).data( 'pagination' ),
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    prevArrow:"<button type='button' class='slick-arrow slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></button>",
                    nextArrow:"<button type='button' class='slick-arrow slick-next pull-right'><i class='fa fa-angle-right' aria-hidden='true'></i></button>",
                };
                
                if( $(this).data('items') ){
                    config.slidesToShow = $(this).data( 'items' );
                    config.slidesToScroll = $(this).data( 'items' );
                }
                if( $(this).data('infinite') ){
                    config.infinite = true;
                }
                if( $(this).data('rows') ){
                    config.rows = $(this).data( 'rows' );
                }
                if( $(this).data('vertical') ){
                    config.vertical = true;
                }
                if( $(this).data('asnavfor') ){
                    config.asNavFor = $(this).data( 'asnavfor' );
                }
                if( $(this).data('slidestoscroll') ){
                    config.slidesToScroll = $(this).data( 'slidestoscroll' );
                }
                if( $(this).data('focusonselect') ){
                    config.focusOnSelect = $(this).data( 'focusonselect' );
                }
                if ($(this).data('large')) {
                    var desktop = $(this).data('large');
                } else {
                    var desktop = config.items;
                }
                if ($(this).data('medium')) {
                    var medium = $(this).data('medium');
                } else {
                    var medium = config.items;
                }
                if ($(this).data('smallmedium')) {
                    var smallmedium = $(this).data('smallmedium');
                } else {
                    var smallmedium = 2;
                }
                if ($(this).data('extrasmall')) {
                    var extrasmall = $(this).data('extrasmall');
                } else {
                    var extrasmall = 1;
                }
                config.responsive = [
                    {
                        breakpoint: 321,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            dots: false
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: extrasmall,
                            slidesToScroll: extrasmall,
                            dots: false
                        }
                    },
                    {
                        breakpoint: 769,
                        settings: {
                            slidesToShow: smallmedium,
                            slidesToScroll: smallmedium
                        }
                    },
                    {
                        breakpoint: 981,
                        settings: {
                            slidesToShow: medium,
                            slidesToScroll: medium
                        }
                    },
                    {
                        breakpoint: 1501,
                        settings: {
                            slidesToShow: desktop,
                            slidesToScroll: desktop
                        }
                    }
                ];
                if ( $('html').attr('dir') == 'rtl' ) {
                    config.rtl = true;
                }

                if ($(this).data('slickparent')) {
                    config.onAfterChange = afterChange;

                    $(this).on('afterChange', function(event, slick, currentSlide, nextSlide){
                        var currentElement = $(slick.$slides.get(currentSlide));
                        gallery.initZoomForTarget( currentElement );
                    });
                }

                $(this).slick( config );

            } );
        }
        var afterChange = function(slider,i) {
            var slideHeight = $(slider.$slides[i] ).height();
            alert($(slider.$slides[i] ).attr('class'));
        };
        slick_init($("[data-carousel=slick-gallery]"));
    };

    /**
     * Init zoom.
     */
    ApusProductGallery.prototype.initZoom = function() {
        if ( $('.details-product.layout-v3').length > 0 ) {
            this.initZoomForTarget(this.$images);
        } else {
            this.initZoomForTarget( this.$images.first() );
        }
    };

    /**
     * Init zoom.
     */
    ApusProductGallery.prototype.initZoomForTarget = function( zoomTarget ) {
        if ( ! this.zoom_enabled ) {
            return false;
        }

        var galleryWidth = this.$target.width(),
            zoomEnabled  = false;

        $( zoomTarget ).each( function( index, target ) {
            var image = $( target ).find( 'img' );

            if ( image.data( 'large_image_width' ) > galleryWidth ) {
                zoomEnabled = true;
                return false;
            }
        } );

        // But only zoom if the img is larger than its container.
        if ( zoomEnabled ) {
            var zoom_options = {
                touch: false
            };

            if ( 'ontouchstart' in window ) {
                zoom_options.on = 'click';
            }

            zoomTarget.trigger( 'zoom.destroy' );
            zoomTarget.zoom( zoom_options );
        }
    };

    /**
     * Init PhotoSwipe.
     */
    ApusProductGallery.prototype.initPhotoswipe = function() {
        if ( this.zoom_enabled && this.$images.length > 0 ) {
            this.$target.prepend( '<a href="#" class="woocommerce-product-gallery__trigger"><i class="fa fa-search-plus" aria-hidden="true"></i></a>' );
            this.$target.on( 'click', '.woocommerce-product-gallery__trigger', this.openPhotoswipe );
        }
        this.$target.on( 'click', '.woocommerce-product-gallery__image a', this.openPhotoswipe );
    };

    /**
     * Get product gallery image items.
     */
    ApusProductGallery.prototype.getGalleryItems = function() {
        var $slides = this.$images,
            items   = [];

        if ( $slides.length > 0 ) {
            $slides.each( function( i, el ) {
                var img = $( el ).find( 'img' ),
                    large_image_src = img.attr( 'data-large_image' ),
                    large_image_w   = img.attr( 'data-large_image_width' ),
                    large_image_h   = img.attr( 'data-large_image_height' ),
                    item            = {
                        src  : large_image_src,
                        w    : large_image_w,
                        h    : large_image_h,
                        title: img.attr( 'data-caption' ) ? img.attr( 'data-caption' ) : img.attr( 'title' )
                    };
                items.push( item );
            } );
        }

        return items;
    };

    /**
     * Open photoswipe modal.
     */
    ApusProductGallery.prototype.openPhotoswipe = function( e ) {
        e.preventDefault();

        var pswpElement = $( '.pswp' )[0],
            items       = this.getGalleryItems(),
            eventTarget = $( e.target ),
            clicked;

        if ( eventTarget.is( '.woocommerce-product-gallery__trigger' ) || eventTarget.is( '.woocommerce-product-gallery__trigger img' ) ) {
            clicked = this.$target.find( '.flex-active-slide' );
        } else {
            clicked = eventTarget.closest( '.woocommerce-product-gallery__image' );
        }

        var options = $.extend( {
            index: $( clicked ).index()
        }, wc_single_product_params.photoswipe_options );

        // Initializes and opens PhotoSwipe.
        var photoswipe = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options );
        photoswipe.init();
    };

    /**
     * Function to call wc_product_gallery on jquery selector.
     */
    $.fn.apus_wc_product_gallery = function( args ) {
        new ApusProductGallery( this, args );
        return this;
    };

    /*
     * Initialize all galleries on page.
     */
    $( '.apus-woocommerce-product-gallery-wrapper' ).each( function() {
        $( this ).apus_wc_product_gallery();
    } );

    $( 'body' ).on( 'found_variation', function( event, variation ) {
        wc_variations_image_update(variation);
    });

    $( 'body' ).on( 'reset_image', function( event, variation ) {
        wc_variations_image_update(variation);
    });

    var wc_variations_image_update = function( variation ) {
        var $form             = $('.variations_form'),
            $product          = $form.closest( '.product' ),
            $product_gallery  = $product.find( '.apus-woocommerce-product-gallery-wrapper' ),
            $gallery_img      = $product.find( '.apus-woocommerce-product-gallery-thumbs img:eq(0)' ),
            $product_img_wrap = $product_gallery.find( '.woocommerce-product-gallery__image, .woocommerce-product-gallery__image--placeholder' ).eq( 0 ),
            $product_img      = $product_img_wrap.find( '.wp-post-image' ),
            $product_link     = $product_img_wrap.find( 'a' ).eq( 0 );


        if ( variation && variation.image && variation.image.src && variation.image.src.length > 1 ) {
            
            if ( $( '.apus-woocommerce-product-gallery-thumbs img[src="' + variation.image.thumb_src + '"]' ).length > 0 ) {
                $( '.apus-woocommerce-product-gallery-thumbs img[src="' + variation.image.thumb_src + '"]' ).trigger( 'click' );
                $form.attr( 'current-image', variation.image_id );
                return;
            } else {
                $product_img.wc_set_variation_attr( 'src', variation.image.src );
                $product_img.wc_set_variation_attr( 'height', variation.image.src_h );
                $product_img.wc_set_variation_attr( 'width', variation.image.src_w );
                $product_img.wc_set_variation_attr( 'srcset', variation.image.srcset );
                $product_img.wc_set_variation_attr( 'sizes', variation.image.sizes );
                $product_img.wc_set_variation_attr( 'title', variation.image.title );
                $product_img.wc_set_variation_attr( 'alt', variation.image.alt );
                $product_img.wc_set_variation_attr( 'data-src', variation.image.full_src );
                $product_img.wc_set_variation_attr( 'data-large_image', variation.image.full_src );
                $product_img.wc_set_variation_attr( 'data-large_image_width', variation.image.full_src_w );
                $product_img.wc_set_variation_attr( 'data-large_image_height', variation.image.full_src_h );
                $product_img_wrap.wc_set_variation_attr( 'data-thumb', variation.image.src );
                $gallery_img.wc_set_variation_attr( 'src', variation.image.thumb_src );
                $gallery_img.wc_set_variation_attr( 'srcset', variation.image.thumb_srcset );

                $product_link.wc_set_variation_attr( 'href', variation.image.full_src );
                $gallery_img.removeAttr('srcset');
                if ($('.apus-woocommerce-product-gallery').data('slickparent') && $('.apus-woocommerce-product-gallery').find('.woocommerce-product-gallery__image').length > 1) {
                    $('.apus-woocommerce-product-gallery').slick('slickGoTo', 0);
                }
                
            }
        } else {
            $product_img.wc_reset_variation_attr( 'src' );
            $product_img.wc_reset_variation_attr( 'width' );
            $product_img.wc_reset_variation_attr( 'height' );
            $product_img.wc_reset_variation_attr( 'srcset' );
            $product_img.wc_reset_variation_attr( 'sizes' );
            $product_img.wc_reset_variation_attr( 'title' );
            $product_img.wc_reset_variation_attr( 'alt' );
            $product_img.wc_reset_variation_attr( 'data-src' );
            $product_img.wc_reset_variation_attr( 'data-large_image' );
            $product_img.wc_reset_variation_attr( 'data-large_image_width' );
            $product_img.wc_reset_variation_attr( 'data-large_image_height' );
            $product_img_wrap.wc_reset_variation_attr( 'data-thumb' );
            $gallery_img.wc_reset_variation_attr( 'src' );
            $product_link.wc_reset_variation_attr( 'href' );
        }

        window.setTimeout( function() {
            $( window ).trigger( 'resize' );
            $form.wc_maybe_trigger_slide_position_reset( variation );
            $product_gallery.trigger( 'woocommerce_gallery_init_zoom' );
        }, 20 );
    };

})(jQuery)

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires+";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}