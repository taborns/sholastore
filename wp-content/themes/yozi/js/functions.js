(function ($) {
    "use strict";
    $.fn.wrapStart = function(numWords){
        return this.each(function(){
            var $this = $(this);
            var node = $this.contents().filter(function(){
                return this.nodeType == 3;
            }).first(),
            text = node.text().trim(),
            first = text.split(' ', 1).join(" ");
            if (!node.length) return;
            node[0].nodeValue = text.slice(first.length);
            node.before('<b>' + first + '</b>');
        });
    }; 

    jQuery(document).ready(function() {
        $('.mod-heading .widget-title > span').wrapStart(1);
        function init_slick(self) {
            self.each( function(){
                var config = {
                    infinite: false,
                    arrows: $(this).data( 'nav' ),
                    dots: $(this).data( 'pagination' ),
                    lazyLoad: 'onDemand',
                    slidesToShow: 4,
                    slidesToScroll: 4,
                    prevArrow:"<button type='button' class='slick-arrow slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></span><span class='textnav'>"+yozi_ajax.previous+"</span></button>",
                    nextArrow:"<button type='button' class='slick-arrow slick-next pull-right'><span class='textnav'>"+yozi_ajax.next+"</span><i class='fa fa-angle-right' aria-hidden='true'></i></button>",
                };
            
                var slick = $(this);
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
                if ($(this).data('smalldesktop')) {
                    var smalldesktop = $(this).data('smalldesktop');
                } else {
                    if ($(this).data('large')) {
                        var smalldesktop = $(this).data('large');
                    } else{
                        var smalldesktop = config.items;
                    }
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
                if ($(this).data('smallest')) {
                    var smallest = $(this).data('smallest');
                } else {
                    var smallest = 1;
                }
                config.responsive = [
                    {
                        breakpoint: 321,
                        settings: {
                            slidesToShow: smallest,
                            slidesToScroll: smallest,
                        }
                    },
                    {
                        breakpoint: 481,
                        settings: {
                            slidesToShow: extrasmall,
                            slidesToScroll: extrasmall,
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
                        breakpoint: 1200,
                        settings: {
                            slidesToShow: smalldesktop,
                            slidesToScroll: smalldesktop
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

                $(this).slick( config );

            } );
        }
        init_slick($("[data-carousel=slick]"));
        
        $('body').on('click', '.apus-woocommerce-product-gallery-thumbs .woocommerce-product-gallery__image a',function(e){
            e.preventDefault();

        });
        // Fix owl in bootstrap tabs
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var target = $(e.target).attr("href");
            var $slick = $("[data-carousel=slick]", target);

            if ($slick.length > 0 && $slick.hasClass('slick-initialized')) {
                $slick.slick('refresh');
            }
            initProductImageLoad();
        });

        // loading ajax
        $('body').on('click', '[data-load="ajax"] a', function(e){
            e.preventDefault();
            var $href = $(this).attr('href');

            $(this).parent().parent().find('li').removeClass('active');
            $(this).parent().addClass('active');

            var self = $(this);
            var main = $($href);
            if ( main.length > 0 ) {
                if ( main.data('loaded') == false ) {
                    main.parent().addClass('loading');
                    main.data('loaded', 'true');

                    $.ajax({
                        url: yozi_ajax.ajaxurl,
                        type:'POST',
                        dataType: 'html',
                        data:  {
                            action: 'yozi_ajax_get_products',
                            settings: main.data('settings'),
                            tab: main.data('tab'),
                            security: yozi_ajax.ajax_nonce
                        }
                    }).done(function(reponse) {
                        main.html( reponse );
                        main.parent().removeClass('loading');
                        main.parent().find('.tab-pane').removeClass('active');
                        main.addClass('active');

                        if ( main.find('.slick-carousel') ) {
                            init_slick(main.find('.slick-carousel'));
                        }
                        initProductImageLoad();
                    });
                    return true;
                } else {
                    main.parent().removeClass('loading');
                    main.parent().find('.tab-pane').removeClass('active');
                    main.addClass('active');

                    var $slick = $("[data-carousel=slick]", main);
                    if ($slick.length > 0 && $slick.hasClass('slick-initialized')) {
                        $slick.slick('refresh');
                    }
                    initProductImageLoad();
                }
            }
        });
        
        setTimeout(function(){
            initProductImageLoad();
        }, 500);
        function initProductImageLoad() {
            $(window).off('scroll.unveil resize.unveil lookup.unveil');
            var $images = $('.image-wrapper:not(.image-loaded) .unveil-image'); // Get un-loaded images only
            if ($images.length) {
                $images.unveil(1, function() {
                    $(this).load(function() {
                        $(this).parents('.image-wrapper').first().addClass('image-loaded');
                        $(this).removeAttr('data-src');
                        $(this).removeAttr('data-srcset');
                        $(this).removeAttr('data-sizes');
                    });
                });
            }

            var $images = $('.product-image:not(.image-loaded) .unveil-image'); // Get un-loaded images only
            if ($images.length) {
                $images.unveil(1, function() {
                    $(this).load(function() {
                        $(this).parents('.product-image').first().addClass('image-loaded');
                    });
                });
            }
        }
        
        //counter up
        if($('.counterUp').length > 0){
            $('.counterUp').counterUp({
                delay: 10,
                time: 800
            });
        }
        /*---------------------------------------------- 
         * Play Isotope masonry
         *----------------------------------------------*/  
        jQuery('.isotope-items').each(function(){  
            var $container = jQuery(this);
            
            setTimeout( function(){
                $container.isotope({
                    itemSelector : '.isotope-item',
                    transformsEnabled: true,         // Important for videos
                    masonry: {
                        columnWidth: $container.data('columnwidth')
                    }
                }); 
            }, 100 );
        });
        /*---------------------------------------------- 
         *    Apply Filter        
         *----------------------------------------------*/
        jQuery('.isotope-filter li a').on('click', function(){
           
            var parentul = jQuery(this).parents('ul.isotope-filter').data('related-grid');
            jQuery(this).parents('ul.isotope-filter').find('li a').removeClass('active');
            jQuery(this).addClass('active');
            var selector = jQuery(this).attr('data-filter'); 
            jQuery('#'+parentul).isotope({ filter: selector }, function(){ });
            
            return(false);
        });

        //Sticky Header
        setTimeout(function(){
            change_margin_top();
        }, 50);
        $(window).resize(function(){
            change_margin_top();
        });
        function change_margin_top() {
            if ($(window).width() > 991) {
                if ( $('.main-sticky-header').length > 0 ) {
                    var header_height = $('.main-sticky-header').outerHeight();
                    $('.main-sticky-header-wrapper').css({'height': header_height});
                }
            }
        }
        var main_sticky = $('.main-sticky-header');
        setTimeout(function(){
            if ( main_sticky.length > 0 ){
                var _menu_action = main_sticky.offset().top;

                var Apus_Menu_Fixed = function(){
                    "use strict";

                    if( $(document).scrollTop() > _menu_action ){
                      main_sticky.addClass('sticky-header');
                    }else{
                      main_sticky.removeClass('sticky-header');
                    }
                }
                if ($(window).width() > 991) {
                    $(window).scroll(function(event) {
                        Apus_Menu_Fixed();
                    });
                    Apus_Menu_Fixed();
                }
            }
        }, 50);

        //Tooltip
        $(function () {
          $('[data-toggle="tooltip"]').tooltip()
        })

        $('.topbar-mobile .dropdown-menu').on('click', function(e) {
            e.stopPropagation();
        });

        var back_to_top = function () {
            jQuery(window).scroll(function () {
                if (jQuery(this).scrollTop() > 400) {
                    jQuery('#back-to-top').addClass('active');
                } else {
                    jQuery('#back-to-top').removeClass('active');
                }
            });
            jQuery('#back-to-top').on('click', function () {
                jQuery('html, body').animate({scrollTop: '0px'}, 800);
                return false;
            });
        };
        back_to_top();
        
        // popup
        $(".popup-image").magnificPopup({type:'image'});
        $('.popup-video').magnificPopup({
            disableOn: 700,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false
        });

        $('.widget-gallery').each(function(){
            var tagID = $(this).attr('id');
            $('#' + tagID).magnificPopup({
                delegate: '.popup-image-gallery',
                type: 'image',
                tLoading: 'Loading image #%curr%...',
                mainClass: 'mfp-img-mobile',
                gallery: {
                    enabled: true,
                    navigateByImgClick: true,
                    preload: [0,1] // Will preload 0 - before current, and 1 after the current image
                }
            });
        });
        

        // perfectScrollbar
        $('.main-menu-top').perfectScrollbar();
        // preload page
        if ( $('body').hasClass('apus-body-loading') ) {
            $('body').removeClass('apus-body-loading');
            $('.apus-page-loading').fadeOut(250);
        }

        // gmap 3
        $('.apus-google-map').each(function(){
            var lat = $(this).data('lat');
            var lng = $(this).data('lng');
            var zoom = $(this).data('zoom');
            var id = $(this).attr('id');
            if ( $(this).data('marker_icon') ) {
                var marker_icon = $(this).data('marker_icon');
            } else {
                var marker_icon = '';
            }
            $('#'+id).gmap3({
                map:{
                    options:{
                        "draggable": true
                        ,"mapTypeControl": true
                        ,"mapTypeId": google.maps.MapTypeId.ROADMAP
                        ,"scrollwheel": false
                        ,"panControl": true
                        ,"rotateControl": false
                        ,"scaleControl": true
                        ,"streetViewControl": true
                        ,"zoomControl": true
                        ,"center":[lat, lng]
                        ,"zoom": zoom
                        ,'styles': $(this).data('style')
                    }
                },
                marker:{
                    latLng: [lat, lng],
                    options: {
                        icon: marker_icon,
                    }
                }
            });
        });
        
        setTimeout(function(){
            vc_rtl();
        }, 100);
        $(window).resize(function(){
            vc_rtl();
        });
        function vc_rtl() {
            if( jQuery('html').attr('dir') == 'rtl' ){
                jQuery('[data-vc-full-width="true"]').each( function(i,v){
                    jQuery(this).css('right' , jQuery(this).css('left') ).css( 'left' , 'auto');
                });
            }
        }

        // popup newsletter
        if ($('.popupnewsletter').length > 0) {
            setTimeout(function(){
                var hiddenmodal = getCookie('hidde_popup_newsletter');
                if (hiddenmodal == "") {
                    var popup_content = $('.popupnewsletter').html();
                    $.magnificPopup.open({
                        mainClass: 'apus-mfp-zoom-in popupnewsletter-wrapper',
                        modal:true,
                        items    : {
                            src : popup_content,
                            type: 'inline'
                        },
                        callbacks: {
                            close: function() {
                                setCookie('hidde_popup_newsletter', 1, 30);
                            }
                        }
                    });
                }
            }, 3000);
        }
        $('.apus-mfp-close').click(function(){
            magnificPopup.close();
        });

        // mmenu
        var mobilemenu = $("#navbar-offcanvas").mmenu({
            offCanvas: true,
        }, {
            // configuration
            offCanvas: {
                pageSelector: "#wrapper-container"
            }
        });

        // sidebar mobile
        $('.sidebar-right, .sidebar-left').perfectScrollbar();
        $('body').on('click', '.mobile-sidebar-btn', function(){
            if ( $('.sidebar-left').length > 0 ) {
                $('.sidebar-left').toggleClass('active');
            } else if ( $('.sidebar-right').length > 0 ) {
                $('.sidebar-right').toggleClass('active');
            }
            $('.mobile-sidebar-panel-overlay').toggleClass('active');
        });
        $('body').on('click', '.mobile-sidebar-panel-overlay, .close-sidebar-btn', function(){
            if ( $('.sidebar-left').length > 0 ) {
                $('.sidebar-left').removeClass('active');
            } else if ( $('.sidebar-right').length > 0 ) {
                $('.sidebar-right').removeClass('active');
            }
            $('.mobile-sidebar-panel-overlay').removeClass('active');
        });

        // vertical
        $('body').on('click', '.mobile-vertical-menu-title', function(){
            $('.mobile-vertical-menu').slideToggle();
            $(this).toggleClass('active');
            if ( $(this).find('i').hasClass('fa-angle-down') ) {
                $(this).find('i').removeClass('fa-angle-down').addClass('fa-angle-up');
            } else {
                $(this).find('i').addClass('fa-angle-down').removeClass('fa-angle-up');
            }
        });
        $("#vertical-mobile-menu .icon-toggle").on('click', function(){
            $(this).parent().find('> .sub-menu').slideToggle();
            if ( $(this).find('i').hasClass('fa-plus') ) {
                $(this).find('i').removeClass('fa-plus').addClass('fa-minus');
            } else {
                $(this).find('i').removeClass('fa-minus').addClass('fa-plus');
            }
            return false;
        } );
        $('body').on('click', '.footer-search-btn', function(){
            $('.footer-search-mobile').toggleClass('active');
        });
        $('body').on('click', '.more', function(){
            $('.wrapper-morelink').toggleClass('active');
        });
    });
    $(document.body).on('click', '.nav [data-toggle="dropdown"]' ,function(){
        if(  this.href && this.href != '#'){
            window.location.href = this.href;
        }
    });
    //  js vertical menu
    $(document).ready(function(){
        $('body').on('click', ".vertical-wrapper .title-vertical", function(){
            $(".vertical-wrapper .content-vertical").slideToggle(300);
        });
    });
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
