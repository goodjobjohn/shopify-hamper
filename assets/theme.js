(function() {
  var FrameworkAlign,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  FrameworkAlign = (function() {
    function FrameworkAlign(element, type1) {
      this.element = element;
      this.type = type1;
      this.resizeListeners = bind(this.resizeListeners, this);
      this.fillYSpace = bind(this.fillYSpace, this);
      this.checkOverlap = bind(this.checkOverlap, this);
      this.createOverlapDetectors = bind(this.createOverlapDetectors, this);
      this.position = bind(this.position, this);
      this.parent = this.element.parent();
      this.left_side_border;
      this.right_element_width = null;
      this.position();
      this.fillYSpace();
      this.createOverlapDetectors();
      this.resizeListeners();
    }

    FrameworkAlign.prototype.position = function() {
      if (this.type === 'center-x') {
        if (!Modernizr.csstransforms) {
          this.element.css({
            'margin-left': -(this.element.outerWidth() / 2)
          });
        }
      }
      if (this.type === 'center-y') {
        if (!Modernizr.csstransforms) {
          return this.element.css({
            'margin-top': -(this.element.outerHeight() / 2)
          });
        }
      }
    };

    FrameworkAlign.prototype.createOverlapDetectors = function() {
      var _this;
      _this = this;
      if (_this.type === 'right') {
        return this.right_element_width = _this.element.outerWidth();
      }
    };

    FrameworkAlign.prototype.checkOverlap = function() {
      var _this, left_element, left_side_border, right_side_border;
      _this = this;
      if (_this.type === 'right') {
        _this.parent.removeClass('overlap');
        left_element = _this.parent.children().eq(_this.element.index() - 1);
        left_side_border = left_element.position().left + left_element.outerWidth();
        right_side_border = _this.parent.outerWidth() - _this.right_element_width;
        if (left_side_border >= right_side_border) {
          return _this.parent.addClass('overlap');
        }
      }
    };

    FrameworkAlign.prototype.fillYSpace = function() {
      var _this, container_height, text_panel_height;
      _this = this;
      if (_this.type === 'fill-y--dynamic') {
        container_height = _this.parent.outerHeight();
        text_panel_height = _this.parent.find('.fw--align--fill-y--fixed').outerHeight();
        return _this.element.outerHeight(container_height - text_panel_height);
      }
    };

    FrameworkAlign.prototype.resizeListeners = function() {
      var _this;
      _this = this;
      $(window).on('resize.FrameworkAlign', function() {
        _this.checkOverlap();
        return _this.fillYSpace();
      });
      return setTimeout(function() {
        return _this.checkOverlap();
      }, 1);
    };

    return FrameworkAlign;

  })();

  theme.classes.FrameworkAnimation = (function() {
    function FrameworkAnimation() {}

    return FrameworkAnimation;

  })();

  theme.classes.FrameworkCart = (function() {
    function FrameworkCart(container1, mq) {
      this.container = container1;
      this.mq = mq;
      this.convertCurrency = bind(this.convertCurrency, this);
      this.openModalListener = bind(this.openModalListener, this);
      this.openOffCanvasListener = bind(this.openOffCanvasListener, this);
      this.removeItem = bind(this.removeItem, this);
      this.removeItemListeners = bind(this.removeItemListeners, this);
      this.updateTotals = bind(this.updateTotals, this);
      this.plusQuantity = bind(this.plusQuantity, this);
      this.minusQuantity = bind(this.minusQuantity, this);
      this.updateQuantityListeners = bind(this.updateQuantityListeners, this);
      this.addItem = bind(this.addItem, this);
      this.renderOther = bind(this.renderOther, this);
      this.renderListener = bind(this.renderListener, this);
      this.renderCart = bind(this.renderCart, this);
      this.adjusting_qty_timer = null;
      this.table_content = this.container.find('form > .content');
      this.render_trigger = $('.fw--cart-modal--trigger-render');
      this.totals = {};
      this.add_locked = false;
      this.render_locked = false;
      if (this.container.hasClass('off-canvas')) {
        this.view = 'off canvas';
      }
      if (this.container.hasClass('modal--content')) {
        this.view = 'modal';
      }
      this.temp_quantity = 0;
      this.renderCart();
      if (this.view === 'off canvas') {
        this.openOffCanvasListener();
      }
      this.openModalListener();
      this.renderListener();
    }

    FrameworkCart.prototype.renderCart = function(callback) {
      var _this;
      _this = this;
      if (!_this.render_locked) {
        _this.render_locked = true;
        _this.table_content.empty();
        return $.ajax({
          type: "POST",
          url: "/cart.js",
          dataType: "json"
        }).done(function(data, textStatus, jqXHR) {
          var cart, index, item, j, len, ref, row;
          if (textStatus === 'success') {
            cart = data;
            if (cart.items.length) {
              _this.container.removeClass('no-items');
            } else {
              _this.container.addClass('no-items');
            }
            ref = cart.items;
            for (index = j = 0, len = ref.length; j < len; index = ++j) {
              item = ref[index];
              item.image_url = Shopify.resizeImage(item.image, "medium");
              item.price = Currency.formatMoney(item.price, theme.money_format);
              if ((index + 1) === cart.items.length) {
                row = '<div class="variant-id last-variant width--12" data-variant-id=' + item.variant_id + '>';
              } else {
                row = '<div class="variant-id width--12" data-variant-id=' + item.variant_id + '>';
              }
              row += '<div class="width--12 width--medium-4 width--large-6 block">';
              if (item.image_url === null) {
                row += '<span class="image block width--4 width--medium-12 width--large-4 spacing--3"></span>';
              } else {
                row += '<span class="image block width--4 width--medium-12 width--large-4 spacing--3"><a href="' + item.url + '"><img src="' + item.image_url + '" alt="' + item.title + '"></a></span>';
              }
              row += '<span class="title show--small show--large block width--8 spacing--3 font--size-4"><a href="' + item.url + '">' + item.title + '</a></span>';
              row += '</div>';
              row += '<div class="right-column width--12 width--medium-8 width--large-6 block spacing--3y text-align--left text-align--large-right">';
              row += '<span class="title show--medium block width--12 spacing--3 font--size-4"><a href="' + item.url + '">' + item.title + '</a></span>';
              row += '<span class="price font--accent spacing--3 font--size-3 money">' + item.price + '</span>';
              row += '<span class="quantity spacing--3"><div class="input--number">';
              row += '<a tabindex="0" aria-label="' + theme.translations.remove_one_item + '" class="minus">' + theme.utils.addSymbol('minus') + '</a>';
              row += '<input type="text" value="' + item.quantity + '" min="1" pattern="[1-9]*">';
              row += '<a tabindex="0" aria-label="' + theme.translations.add_one_item + '" class="plus">' + theme.utils.addSymbol('plus') + '</a>';
              row += '</div></span>';
              row += '<span class="remove spacing--3">';
              row += '<a aria-label="' + theme.translations.remove_item + '" role="button" href="#" class="cart--remove-button remove">' + theme.utils.addSymbol('cross-circle') + '</a>';
              row += '</span>';
              row += '</div>';
              row += '</div>';
              row += '<div class="spacer spacing--3y"></div>';
              _this.table_content.append(row);
            }
            row = '<div class="totals width--12 text-align--center ">';
            row += '<div class="width--12 width--large-8 block">';
            row += '</div>';
            row += '<div class="block spacing--3y width--12 width--large-4 font--size-3 text--bold text-align--large-right text--uppercase">';
            row += '<span class="spacing--3">' + theme.translations.cart_subtotal + '</span>';
            row += '<span class="total spacing--3 money font--accent font--subheading--size">' + _this.totals.price + '</span>';
            row += '</div>';
            row += '</div>';
            row += '<div class="spacer spacing--3y show--small-medium"></div>';
            _this.table_content.append(row);
            _this.updateTotals();
            if (window.Shopify && Shopify.StorefrontExpressButtons) {
              Shopify.StorefrontExpressButtons.initialize();
            }
            if (callback) {
              callback();
            }
            $(window).trigger('resize.FrameworkModal');
            _this.render_locked = false;
            _this.removeItemListeners();
            _this.updateQuantityListeners();
            return _this.convertCurrency(_this.container.find('.money'));
          } else {
            return console.log('cart - render item status - ' + textStatus);
          }
        }).fail(function(jqXHR, textStatus) {
          console.log("cart rendering failed");
          return _this.render_locked = false;
        });
      }
    };

    FrameworkCart.prototype.renderListener = function() {
      var _this;
      _this = this;
      return this.container.on('renderCart', function() {
        return _this.renderCart();
      });
    };

    FrameworkCart.prototype.renderOther = function() {
      if (this.mq.current_window === 'small') {
        return $('.fw--cart.modal--content').trigger('renderCart');
      } else {
        return $('.fw--cart.off-canvas').trigger('renderCart');
      }
    };

    FrameworkCart.prototype.addItem = function(form, callback) {
      var _this;
      _this = this;
      if (!_this.add_locked) {
        _this.add_locked = true;
        return $.ajax({
          type: "POST",
          url: "/cart/add.js",
          dataType: "json",
          data: form.serialize()
        }).done(function(data, textStatus, jqXHR) {
          callback(true);
          _this.renderOther();
          return _this.add_locked = false;
        }).fail(function(jqXHR, textStatus) {
          callback(false, jqXHR.responseJSON.description);
          return _this.add_locked = false;
        });
      }
    };

    FrameworkCart.prototype.updateQuantityListeners = function() {
      var _this;
      _this = this;
      this.table_content.find('.input--number input').attr("autocomplete", "off").on('keyup.LayoutCartModal paste.LayoutCartModal', function() {
        var input, input_wrapper, variant_id;
        input_wrapper = $(this).closest('.input--number');
        input = input_wrapper.find('input');
        if (parseInt(input.val()) > 0) {
          input_wrapper.addClass('updating');
          clearTimeout(_this.adjusting_qty_timer);
          variant_id = $(this).closest('.variant-id').data('variant-id');
          _this.adjusting_qty_timer = setTimeout(function() {
            _this.updateCart(variant_id, parseInt(input.val()));
            input_wrapper.removeClass('updating');
            return _this.updateTotals();
          }, 500);
        } else if (parseInt(input.val()) === 0) {
          variant_id = $(this).closest('.variant-id').data('variant-id');
          _this.removeItem(variant_id);
          if ($(this).closest('form').find('.variant-id').length === 1) {
            _this.container.addClass('no-items');
          } else {
            $(this).closest('.variant-id').remove();
          }
        }
        return false;
      });
      this.table_content.find('.input--number .minus').on('keypress.LayoutCartModal click.LayoutCartModal', function(e) {
        var input, input_wrapper, variant_id;
        if (theme.utils.a11yClick(e) === true) {
          input_wrapper = $(this).closest('.input--number');
          input = input_wrapper.find('input');
          if (parseInt(input.val()) > 1) {
            input_wrapper.addClass('updating');
            clearTimeout(_this.adjusting_qty_timer);
            input.val(parseInt(input.val()) - 1);
            variant_id = $(this).closest('.variant-id').data('variant-id');
            _this.adjusting_qty_timer = setTimeout(function() {
              _this.minusQuantity(variant_id, parseInt(input.val()));
              input_wrapper.removeClass('updating');
              return _this.updateTotals();
            }, 500);
          }
          return false;
        }
      });
      return this.table_content.find('.input--number .plus').on('keypress.LayoutCartModal click.LayoutCartModal', function(e) {
        var input, input_wrapper, variant_id;
        if (theme.utils.a11yClick(e) === true) {
          clearTimeout(_this.adjusting_qty_timer);
          input_wrapper = $(this).closest('.input--number');
          input = input_wrapper.find('input');
          if (_this.temp_quantity === 0) {
            _this.temp_quantity = parseInt(input.val());
          }
          input_wrapper.addClass('updating');
          input.val(1 + parseInt(input.val()));
          variant_id = $(this).closest('.variant-id').data('variant-id');
          _this.adjusting_qty_timer = setTimeout(function() {
            var add_quantity;
            add_quantity = parseInt(input.val()) - _this.temp_quantity;
            return _this.plusQuantity(variant_id, add_quantity, function(pass, error) {
              if (pass) {
                input_wrapper.removeClass('updating');
                _this.updateTotals();
                return _this.temp_quantity = 0;
              } else {
                input.val(_this.temp_quantity);
                input_wrapper.removeClass('updating');
                _this.updateTotals();
                return _this.temp_quantity = 0;
              }
            });
          }, 500);
          return false;
        }
      });
    };

    FrameworkCart.prototype.minusQuantity = function(variant_id, quantity) {
      var _this;
      _this = this;
      return $.ajax({
        type: "POST",
        url: "/cart/change.js",
        dataType: "json",
        data: 'quantity=' + quantity + '&id=' + variant_id,
        async: false
      }).done(function(data, textStatus, jqXHR) {
        if (textStatus === 'success') {
          _this.updateTotals();
          return _this.renderOther();
        } else {
          return console.log('cart - update cart item status - ' + textStatus);
        }
      }).fail(function(jqXHR, textStatus) {
        return console.log("cart - update failed");
      });
    };

    FrameworkCart.prototype.plusQuantity = function(variant_id, quantity, callback) {
      var _this;
      _this = this;
      if (!_this.add_locked) {
        _this.add_locked = true;
        return $.ajax({
          type: "POST",
          url: "/cart/add.js",
          dataType: "json",
          data: 'quantity=' + quantity + '&id=' + variant_id
        }).done(function(data, textStatus, jqXHR) {
          callback(true);
          _this.renderOther();
          return _this.add_locked = false;
        }).fail(function(jqXHR, textStatus) {
          callback(false, jqXHR.responseJSON.description);
          return _this.add_locked = false;
        });
      }
    };

    FrameworkCart.prototype.updateTotals = function() {
      var _this;
      _this = this;
      return $.ajax({
        type: "POST",
        url: "/cart.js",
        dataType: "json"
      }).done(function(data, textStatus, jqXHR) {
        var cart, cart_total, item, j, len, ref;
        if (textStatus === 'success') {
          cart = data;
          cart_total = {};
          cart_total.quantity = 0;
          cart_total.price = 0;
          ref = cart.items;
          for (j = 0, len = ref.length; j < len; j++) {
            item = ref[j];
            cart_total.quantity += item.quantity;
            cart_total.price += item.price * item.quantity;
          }
          _this.totals.count = cart_total.quantity;
          _this.totals.price = Currency.formatMoney(cart_total.price, theme.money_format);
          _this.render_trigger.find('.count').html(_this.totals.count);
          _this.render_trigger.find('.total-price').html(_this.totals.price);
          _this.table_content.find('.total').html(_this.totals.price);
          $('.layout--header .layout--off-canvas--trigger.right').html(_this.totals.count);
          $('.layout--header .cart-link .count').html('(' + _this.totals.count + ')');
          if (_this.totals.count > 0) {
            _this.render_trigger.css('display', 'inline-block');
            $('.layout--header .cart-link .count').css('display', 'inline');
            $('.layout--header .cart-count').css('display', 'inline-block');
          } else {
            _this.render_trigger.hide();
            $('.layout--header .cart-link .count').hide();
          }
          if (theme.currency_switcher_enabled) {
            _this.convertCurrency(_this.render_trigger.find('.total-price'));
            return _this.convertCurrency(_this.table_content.find('.total'));
          }
        } else {
          return console.log('cart - update totals item status - ' + textStatus);
        }
      }).fail(function(jqXHR, textStatus) {
        return console.log("cart - updating totals failed");
      });
    };

    FrameworkCart.prototype.removeItemListeners = function() {
      var _this;
      _this = this;
      return this.table_content.find('a.remove').on('click.LayoutCartModal', function() {
        var variant_id;
        variant_id = $(this).closest('.variant-id').data('variant-id');
        _this.removeItem(variant_id);
        if ($(this).closest('form').find('.variant-id').length === 1) {
          _this.container.addClass('no-items');
          $(window).trigger('resize.FrameworkModal');
        } else {
          $(this).closest('.variant-id').remove();
        }
        _this.updateTotals();
        return false;
      });
    };

    FrameworkCart.prototype.removeItem = function(variant_id) {
      return this.minusQuantity(variant_id, 0);
    };

    FrameworkCart.prototype.openOffCanvasListener = function() {
      return $('.layout--off-canvas--cart--open-trigger').on('click', function() {
        $('.layout--off-canvas--sidebar.right').trigger('open');
        return false;
      });
    };

    FrameworkCart.prototype.openModalListener = function() {
      return $('.fw--cart-modal--trigger-render').on('click', function() {
        $('.cart-link .modal--link').trigger('click');
        return false;
      });
    };

    FrameworkCart.prototype.convertCurrency = function(elems) {
      if (theme.currency_switcher_enabled) {
        return Currency.convertAll(Currency.shop_currency, Currency.currentCurrency, elems, null, true);
      } else {
        return false;
      }
    };

    return FrameworkCart;

  })();

  theme.classes.FrameworkLoadingAnimation = (function() {
    function FrameworkLoadingAnimation(container1) {
      this.container = container1;
      this.loading_animation = $('.fw--loading_animation');
      if (this.loading_animation.hasClass('tiny')) {
        this.loading_animation.spin('tiny');
      } else {
        this.loading_animation.spin('small');
      }
    }

    return FrameworkLoadingAnimation;

  })();

  theme.classes.FrameworkMediaQueries = (function() {
    function FrameworkMediaQueries() {
      this.screenSizeListener = bind(this.screenSizeListener, this);
      this.getScreenSize = bind(this.getScreenSize, this);
      this.medium_screen = 768;
      this.large_screen = 1024;
      this.current_window = null;
      this.getScreenSize();
      this.screenSizeListener();
    }

    FrameworkMediaQueries.prototype.getScreenSize = function() {
      var _this;
      _this = this;
      if ($("html").hasClass("lt-ie9")) {
        $.event.trigger("largeWindow");
        return _this.current_window = 'large';
      } else if (window.matchMedia('only screen and (min-width: ' + _this.large_screen + 'px)').matches) {
        if (_this.current_window !== 'large') {
          $.event.trigger("largeWindow");
          return _this.current_window = 'large';
        }
      } else if (window.matchMedia('only screen and (min-width: ' + _this.medium_screen + 'px)').matches) {
        if (_this.current_window !== 'medium') {
          $.event.trigger("mediumWindow");
          return _this.current_window = 'medium';
        }
      } else {
        if (_this.current_window !== 'small') {
          $.event.trigger("smallWindow");
          return _this.current_window = 'small';
        }
      }
    };

    FrameworkMediaQueries.prototype.screenSizeListener = function() {
      var _this;
      _this = this;
      return $(window).resize(function() {
        return _this.getScreenSize();
      });
    };

    return FrameworkMediaQueries;

  })();

  theme.classes.FrameworkModal = (function() {
    function FrameworkModal(container1) {
      var _this;
      this.container = container1;
      _this = this;
      _this.fullscreen = _this.container.data('modal--fullscreen') ? true : false;
      if (_this.container.data('modal--align-close')) {
        _this.align_close_button = _this.container.data('modal--align-close');
      } else {
        _this.align_close_button = '';
      }
      _this.view = _this.container.data('modal--view');
      _this.links = _this.container.find('.modal--link');
      _this.content = _this.container.find('.modal--content');
      _this.spinner = null;
      _this.window = _this.createModalWindow();
      _this.spinner = _this.window.find('.fw--loading_animation');
      _this.spinner.spin('large', '#fff');
      _this.window_container = _this.window.find('.modal--container');
      _this.mask = _this.window.find('.modal--mask');
      _this.close_button = _this.window.find('.modal--close');
      _this.next_button = _this.window.find('.modal--next');
      _this.prev_button = _this.window.find('.modal--prev');
      _this.slider = null;
      _this.slides = null;
      _this.main_content_window = $('.fw--off-canvas--main-content');
      _this.openListeners();
      _this.modal_state = 'closed';
      _this.nav_lock = false;
    }

    FrameworkModal.prototype.createModalWindow = function() {
      var _this, window, window_html;
      _this = this;
      window = null;
      if ($('.modal--window').length) {
        window = $('.modal--window');
      } else {
        window_html = '<div class="modal--window"> <div class="modal--mask"></div> <div class="fw--loading_animation"></div> <div class="modal--container"></div> <button class="modal--close">' + theme.utils.addSymbol('cross') + '</button> <button class="modal--prev">' + theme.utils.addSymbol('chevron-left') + '</button> <button class="modal--next">' + theme.utils.addSymbol('chevron-right') + '</button> </div>';
        window = $(window_html).appendTo('body');
      }
      return window;
    };

    FrameworkModal.prototype.openListeners = function() {
      var _this;
      _this = this;
      return _this.links.on('keypress.FrameworkModal, click.FrameworkModal', function(e) {
        var clicked_item;
        if (theme.utils.a11yClick(e) === true) {
          clicked_item = $(this);
          _this.links.each(function(index) {
            if ($(this).is(clicked_item)) {
              return _this.open(index);
            }
          });
        }
        return false;
      });
    };

    FrameworkModal.prototype.open = function(index) {
      var _this, scrolled_position;
      _this = this;
      if (_this.modal_state === 'closed') {
        _this.modal_state = 'opened';
        $('html').addClass('modal-open');
        _this.window.attr('data-modal--fullscreen', _this.fullscreen);
        _this.window.attr('data-modal--align-close', _this.align_close_button);
        _this.window.attr('data-modal--view', _this.view);
        _this.closeListeners();
        _this.positionListeners();
        scrolled_position = $(window).scrollTop();
        _this.main_content_window.css({
          position: 'fixed',
          top: -scrolled_position
        });
        _this.moveContentToWindow();
        if (_this.slides.length > 1) {
          _this.next_button.show();
          _this.prev_button.show();
          _this.prevListeners();
          _this.nextListeners();
        }
        _this.window.show();
        _this.mask.fadeIn();
        _this.window_container.show();
        _this.renderVideo(_this.slides.eq(index));
        return _this.loadModal(_this.slides.eq(index), function() {
          return setTimeout(function() {
            return _this.window_container.find('input[type="text"]').focus();
          }, 0);
        });
      }
    };

    FrameworkModal.prototype.moveContentToWindow = function(index) {
      var _this, content;
      _this = this;
      content = _this.container.find('.modal--content');
      _this.window_container.append(content);
      return _this.slides = _this.window_container.find('.modal--content');
    };

    FrameworkModal.prototype.detectImageSlide = function(slide) {
      var _this;
      _this = this;
      if (slide.children().length === 1 && slide.children().first().is('img')) {
        slide.addClass('type--image');
        return slide.find('img').css({
          'max-height': $(window).height()
        });
      }
    };

    FrameworkModal.prototype.renderVideo = function(slide) {
      var _this, id, iframe, src_url, type, video;
      _this = this;
      video = slide.find('.responsive-video').first();
      src_url = video.data('video');
      type = _this.extractVideoType(src_url);
      id = _this.extractVideoId(src_url, type);
      iframe = _this.createIframe(type, id);
      if (type === 'vimeo') {
        video.addClass('vimeo');
      }
      if (type === 'kickstarter') {
        video.addClass('kickstarter');
      }
      return video.append(iframe);
    };

    FrameworkModal.prototype.extractVideoType = function(src_url) {
      var _this, matches, re;
      _this = this;
      re = /\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9_\-]+)/i;
      matches = re.exec(src_url);
      if (matches) {
        return 'youtube';
      }
      re = /^.*(vimeo)\.com\/(?:watch\?v=)?(.*?)(?:\z|$|&)/;
      matches = re.exec(src_url);
      if (matches) {
        return 'vimeo';
      }
      re = /^.*(kickstarter)\.com/g;
      matches = re.exec(src_url);
      if (matches) {
        return 'kickstarter';
      }
      return false;
    };

    FrameworkModal.prototype.extractVideoId = function(src_url, type) {
      var _this, match, regExp;
      _this = this;
      if (type === 'youtube') {
        regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        match = src_url.match(regExp);
        if (match && match[2].length === 11) {
          return match[2];
        }
      } else if (type === "vimeo") {
        regExp = /^.*(vimeo)\.com\/(?:watch\?v=)?(.*?)(?:\z|$|&)/;
        match = src_url.match(regExp);
        if (match) {
          return match[2];
        }
      } else if (type === "kickstarter") {
        regExp = /(?:kickstarter\.com\/projects\/)(.*)(|\?)/;
        match = src_url.match(regExp);
        if (match) {
          return match[1];
        }
      }
    };

    FrameworkModal.prototype.createIframe = function(type, id) {
      var _this;
      _this = this;
      if (type === "youtube") {
        return '<iframe  src="//www.youtube.com/embed/' + id + '?autoplay=1" frameborder="0" allowfullwidth></iframe>';
      } else if (type === "vimeo") {
        return '<iframe src="//player.vimeo.com/video/' + id + '?title=0&amp;byline=0&amp;portrait=0&amp;color=ffffff&amp;autoplay=1?" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
      } else if (type === "kickstarter") {
        return '<iframe src="//www.kickstarter.com/projects/' + id + '/widget/video.html" frameborder="0" webkitallowfullwidth mozallowfullwidth allowfullwidth></iframe>';
      }
    };

    FrameworkModal.prototype.removeVideos = function() {
      var _this;
      _this = this;
      return _this.slides.find('.responsive-video').each(function() {
        if ($(this).data('video')) {
          return $(this).find('iframe').remove();
        }
      });
    };

    FrameworkModal.prototype.loadModal = function(modal, callback) {
      var _this;
      _this = this;
      _this.spinner.show();
      return setTimeout(function() {
        return modal.imagesLoaded(function() {
          _this.spinner.hide();
          modal.addClass('active');
          _this.position();
          if (callback) {
            callback();
          }
          return _this.nav_lock = false;
        });
      }, 300);
    };

    FrameworkModal.prototype.position = function() {
      var _this, active_modal, entire_modal_height, modal_height, modal_width;
      _this = this;
      if (_this.window_container != null) {
        active_modal = _this.content.filter('.active');
        _this.window_container.attr('style', '');
        _this.positionVideoColumns(active_modal);
        _this.detectImageSlide(active_modal);
        _this.window.removeClass('fixed');
        modal_height = active_modal.outerHeight();
        modal_width = active_modal.outerWidth();
        entire_modal_height = modal_height + parseInt(_this.window.css('padding-top')) + parseInt(_this.window.css('padding-bottom'));
        if (active_modal.hasClass('type--image')) {
          entire_modal_height = modal_height;
        }
        if ($(window).height() >= entire_modal_height) {
          return _this.window.addClass('fixed');
        } else {
          $("html, body").animate({
            scrollTop: 0
          }, '0');
          $('body,html').on('DOMMouseScroll.FrameworkModal mousewheel.FrameworkModal touchmove.FrameworkModal', function(e) {
            if (e.which > 0 || e.type === "mousewheel" || e.type === "touchmove") {
              return $("html,body").stop();
            }
          });
          return _this.window.removeClass('fixed');
        }
      }
    };

    FrameworkModal.prototype.positionVideoColumns = function(modal) {
      var _this, column_one, column_two, height_one, height_two;
      _this = this;
      if (modal.find('.responsive-video').length > 0) {
        column_one = modal.find('.fw--blocks > div').eq(0);
        column_two = modal.find('.fw--blocks > div').eq(1);
        column_one.css({
          width: ''
        });
        column_two.css({
          width: ''
        });
        height_one = column_one.outerHeight();
        height_two = column_two.outerHeight();
        if (height_one < height_two) {
          column_one.css({
            width: '100%'
          });
          return column_two.css({
            width: '100%'
          });
        }
      }
    };

    FrameworkModal.prototype.positionListeners = function() {
      var _this;
      _this = this;
      return $(window).on('resize.FrameworkModal', function() {
        return _this.position();
      });
    };

    FrameworkModal.prototype.nextListeners = function() {
      var _this;
      _this = this;
      $(document).on('keydown.FrameworkModal', function(e) {
        if (e.keyCode === 39) {
          return _this.next();
        }
      });
      return _this.next_button.on('click.FrameworkModal', function() {
        return _this.next();
      });
    };

    FrameworkModal.prototype.next = function() {
      var _this, active_slide, index;
      _this = this;
      if (!_this.nav_lock) {
        _this.nav_lock = true;
        index = _this.slides.filter('.active').index();
        _this.slides.removeClass('active');
        _this.removeVideos();
        if ((index + 1) === _this.slides.length) {
          active_slide = _this.slides.eq(0);
        } else {
          active_slide = _this.slides.eq(index + 1);
        }
        _this.renderVideo(active_slide);
        return _this.loadModal(active_slide);
      }
    };

    FrameworkModal.prototype.prevListeners = function() {
      var _this;
      _this = this;
      $(document).on('keydown.FrameworkModal', function(e) {
        if (e.keyCode === 37) {
          return _this.prev();
        }
      });
      return _this.prev_button.on('click.FrameworkModal', function() {
        return _this.prev();
      });
    };

    FrameworkModal.prototype.prev = function() {
      var _this, active_slide, index;
      _this = this;
      if (!_this.nav_lock) {
        _this.nav_lock = true;
        index = _this.slides.filter('.active').index();
        _this.slides.removeClass('active');
        _this.removeVideos();
        if (index === 0) {
          active_slide = _this.slides.eq(_this.slides.length - 1);
        } else {
          active_slide = _this.slides.eq(index - 1);
        }
        _this.renderVideo(active_slide);
        return _this.loadModal(active_slide);
      }
    };

    FrameworkModal.prototype.closeListeners = function() {
      var _this;
      _this = this;
      $(document).on('keydown.FrameworkModal', function(e) {
        if (e.keyCode === 27) {
          return _this.close();
        }
      });
      _this.mask.on('click.FrameworkModal', function() {
        return _this.close();
      });
      _this.window_container.on('click.FrameworkModal', function() {
        return _this.close();
      });
      _this.content.on('click.FrameworkModal', function(e) {
        return e.stopPropagation();
      });
      return _this.close_button.on('click.FrameworkModal', function() {
        return _this.close();
      });
    };

    FrameworkModal.prototype.close = function() {
      var _this, scrolled_position;
      _this = this;
      $('html').removeClass('modal-open');
      if (!$('.fw--loading_animation').is(':visible')) {
        _this = this;
        scrolled_position = parseInt(_this.main_content_window.css('top')) * -1;
        _this.container.trigger('modalClosed');
        _this.main_content_window.css({
          top: '0',
          position: 'relative'
        });
        $(window).scrollTop(scrolled_position);
        _this.putBackContent();
        _this.next_button.hide();
        _this.prev_button.hide();
        _this.window.hide();
        _this.mask.fadeOut(function() {
          _this.window_container.empty();
          return _this.modal_state = 'closed';
        });
        return _this.removeListeners();
      }
    };

    FrameworkModal.prototype.putBackContent = function() {
      var _this;
      _this = this;
      _this.removeVideos();
      return _this.slides.removeClass('active').appendTo(_this.container);
    };

    FrameworkModal.prototype.removeListeners = function() {
      var _this;
      _this = this;
      $(document).off('keydown.FrameworkModal');
      $(window).off('resize.FrameworkModal');
      $('body,html').off('DOMMouseScroll.FrameworkModal mousewheel.FrameworkModal touchmove.FrameworkModal');
      _this.next_button.off('click.FrameworkModal');
      _this.prev_button.off('click.FrameworkModal');
      _this.close_button.off('click.FrameworkModal');
      _this.mask.off('click.FrameworkModal');
      return _this.window_container.off('click.FrameworkModal');
    };

    return FrameworkModal;

  })();

  theme.classes.FrameworkOffCanvas = (function() {
    function FrameworkOffCanvas() {
      this.closeRight = bind(this.closeRight, this);
      this.closeLeft = bind(this.closeLeft, this);
      this.closeListeners = bind(this.closeListeners, this);
      this.fadeInOverlay = bind(this.fadeInOverlay, this);
      this.openRight = bind(this.openRight, this);
      this.openLeft = bind(this.openLeft, this);
      this.openListeners = bind(this.openListeners, this);
      this.viewPortHeightListener = bind(this.viewPortHeightListener, this);
      this.setViewPortHeight = bind(this.setViewPortHeight, this);
      this.toggleListeners = bind(this.toggleListeners, this);
      this.viewport = $('.fw--off-canvas--viewport');
      this.left_sidebar = $('.fw--off-canvas--sidebar.left');
      this.right_sidebar = $('.fw--off-canvas--sidebar.right');
      this.main_content = $('.fw--off-canvas--main-content');
      this.overlay = this.main_content.find('> .overlay');
      this.triggers = $('.fw--off-canvas--trigger');
      this.state = 'closed';
      this.setViewPortHeight();
      this.viewPortHeightListener();
      this.openListeners();
      this.closeListeners();
    }

    FrameworkOffCanvas.prototype.toggleListeners = function() {
      var _this;
      _this = this;
      return this.sub_menu_links.on('click.LayoutMainMenu', function() {
        if (_this.state === 'closed') {
          _this.open($(this));
        } else if ($(this).hasClass('open')) {
          _this.close($(this));
        } else {
          _this.changeTo($(this));
        }
        return false;
      });
    };

    FrameworkOffCanvas.prototype.setViewPortHeight = function() {
      var _this;
      _this = this;
      return _this.viewport.css({
        'min-height': $(window).height()
      });
    };

    FrameworkOffCanvas.prototype.viewPortHeightListener = function() {
      var _this;
      _this = this;
      return $(window).resize(function() {
        return _this.setViewPortHeight();
      });
    };

    FrameworkOffCanvas.prototype.openListeners = function() {
      var _this;
      _this = this;
      this.triggers.on('click', function() {
        if ($(this).hasClass('open left')) {
          return _this.openLeft();
        } else if ($(this).hasClass('open right')) {
          return _this.openRight();
        }
      });
      return this.right_sidebar.on('open', function() {
        return _this.openRight();
      });
    };

    FrameworkOffCanvas.prototype.openLeft = function() {
      var _this;
      _this = this;
      this.state = 'left-open';
      _this.main_content.css({
        position: 'fixed',
        top: -($(window).scrollTop())
      });
      this.left_sidebar.velocity({
        translateX: [0, '-100%']
      }, {
        complete: function() {
          return _this.left_sidebar.css({
            position: 'relative',
            height: $(window).height()
          });
        }
      });
      this.main_content.velocity({
        translateX: ['90%', 0]
      });
      return this.fadeInOverlay();
    };

    FrameworkOffCanvas.prototype.openRight = function() {
      var _this;
      _this = this;
      this.state = 'right-open';
      _this.main_content.css({
        position: 'fixed',
        top: -($(window).scrollTop())
      });
      this.right_sidebar.velocity({
        translateX: [0, '100%']
      }, {
        complete: function() {
          return _this.right_sidebar.css({
            position: 'relative',
            left: '10%'
          });
        }
      });
      this.main_content.velocity({
        translateX: ['-90%', 0]
      });
      return this.fadeInOverlay();
    };

    FrameworkOffCanvas.prototype.fadeInOverlay = function() {
      this.overlay.show();
      return this.overlay.velocity({
        opacity: '0.5'
      });
    };

    FrameworkOffCanvas.prototype.closeListeners = function() {
      var _this;
      _this = this;
      return this.overlay.on('click', function() {
        if (_this.state === 'left-open') {
          return _this.closeLeft();
        } else if (_this.state === 'right-open') {
          return _this.closeRight();
        }
      });
    };

    FrameworkOffCanvas.prototype.closeLeft = function() {
      var _this, scrolled_position;
      _this = this;
      this.state = 'closed';
      scrolled_position = parseInt(this.main_content.css('top')) * -1;
      this.left_sidebar.css({
        position: 'absolute'
      });
      this.main_content.css({
        position: 'relative',
        top: 'initial'
      });
      $(window).scrollTop(scrolled_position);
      this.left_sidebar.velocity({
        translateX: ['-100%', 0]
      });
      this.main_content.velocity({
        translateX: [0, '90%']
      });
      return this.overlay.velocity('fadeOut');
    };

    FrameworkOffCanvas.prototype.closeRight = function() {
      var _this, scrolled_position;
      _this = this;
      this.state = 'closed';
      scrolled_position = parseInt(this.main_content.css('top')) * -1;
      this.right_sidebar.css({
        position: 'absolute',
        left: 'auto'
      });
      this.main_content.css({
        position: 'relative',
        top: 'initial'
      });
      $(window).scrollTop(scrolled_position);
      this.right_sidebar.velocity({
        translateX: ['100%', 0]
      });
      this.main_content.velocity({
        translateX: [0, '-90%']
      });
      return this.overlay.velocity('fadeOut');
    };

    return FrameworkOffCanvas;

  })();

  theme.classes.FrameworkSearch = (function() {
    function FrameworkSearch(container1) {
      this.container = container1;
      this.linkRows = bind(this.linkRows, this);
      this.closeListeners = bind(this.closeListeners, this);
      this.hideResults = bind(this.hideResults, this);
      this.focusListener = bind(this.focusListener, this);
      this.getResults = bind(this.getResults, this);
      this.focusModalAlways = bind(this.focusModalAlways, this);
      this.listenForKeyEntered = bind(this.listenForKeyEntered, this);
      this.loadSpinners = bind(this.loadSpinners, this);
      this.toggle_link = this.container.find('a.toggle');
      this.form = this.container.find('form');
      this.text_box = this.form.find('input[name="q"]');
      this.loading = this.container.find('> .feedback .loading');
      this.no_results = this.container.find('> .feedback .no-results');
      this.results = this.container.find('> .results');
      this.view = this.container.data('view');
      this.max_results = 12;
      this.ajax_request = null;
      this.search_term = null;
      this.search_url = null;
      this.close_results_timer = null;
      this.typing_timer = null;
      this.focusModalAlways();
      this.listenForKeyEntered();
      this.loadSpinners();
    }

    FrameworkSearch.prototype.loadSpinners = function() {
      var spinner;
      spinner = this.loading.find('> .animation');
      if (spinner.hasClass('tiny')) {
        return spinner.spin('tiny');
      } else {
        return spinner.spin('small');
      }
    };

    FrameworkSearch.prototype.listenForKeyEntered = function() {
      var _this;
      _this = this;
      return this.text_box.attr("autocomplete", "off").on("keyup paste", function() {
        var term;
        clearTimeout(_this.typing_timer);
        term = $(this).val();
        _this.results.hide();
        _this.loading.show();
        _this.no_results.hide();
        return _this.typing_timer = setTimeout(function() {
          _this.search_url = "/search?type=product&q=" + term;
          if (term.length > 1) {
            return _this.getResults(term);
          } else {
            _this.results.empty();
            _this.hideResults();
            return _this.loading.hide();
          }
        }, 300);
      });
    };

    FrameworkSearch.prototype.focusModalAlways = function() {
      var _this;
      _this = this;
      if (this.view === 'grid') {
        return this.container.on('click', function() {
          return _this.text_box.focus();
        });
      }
    };

    FrameworkSearch.prototype.getResults = function(term) {
      var _this;
      _this = this;
      if (this.ajax_request) {
        this.ajax_request.abort();
      }
      this.results.empty();
      this.ajax_request = $.getJSON(this.search_url + "&view=json", function(data) {
        if (data.results_count === 0) {
          _this.close_results_timer = setTimeout(function() {
            _this.hideResults();
            _this.no_results.show();
            return _this.loading.hide();
          }, 300);
        } else {
          clearTimeout(_this.close_results_timer);
          _this.loading.hide();
          _this.no_results.hide();
          _this.results.show();
          _this.results.stop(true, true).fadeIn(0);
          $.each(data.results, function(index, item) {
            var row;
            if (index >= _this.max_results) {
              return;
            }
            if (_this.view === 'grid') {
              row = "<div class=\"partial--product item column width--medium-4 width--large-3\" data-link=\"" + item.url + "\">";
              row += '<a href="' + item.url + '">';
              row += '<div class="image-wrapper"><img src="' + item.image_medium + '" /></div>';
              row += '<div class="caption"><p class="title">' + item.title + '</p></div>';
              row += '</a></div>';
              row = $(row);
            } else if (_this.view === 'list') {
              row = $('<a class="item" href="' + item.url + '"><span class="image-wrapper"><img src="' + item.image_thumb + '" /></span><span class="title">' + item.title + '</span></a>');
            }
            _this.results.append(row);
          });
          $.event.trigger("ie8ClearingFix");
          if (data.results_count > _this.max_results) {
            _this.results.append('<div class="row view-more"><a href="' + _this.search_url + '">' + theme.translations.general_search_see_all_results + ' ("' + data.results_count + '")</a></div>');
          }
          _this.closeListeners();
        }
      }).fail(function() {
        return console.log("error retrieving search.json results");
      });
    };

    FrameworkSearch.prototype.focusListener = function() {
      var _this;
      _this = this;
      return this.text_box.on('focus', function() {
        return _this.results.show();
      });
    };

    FrameworkSearch.prototype.hideResults = function() {
      this.results.fadeOut(0);
      return this.focusListener();
    };

    FrameworkSearch.prototype.closeListeners = function() {
      var _this;
      _this = this;
      if (this.view !== "grid") {
        this.linkRows();
        $(document).on('click', function(event) {
          if (!$(event.target).closest('.partial--searchbar').length) {
            return _this.hideResults();
          }
        });
        return $(document).keydown(function(e) {
          if (e.keyCode === 27) {
            return _this.text_box.trigger('blur');
          }
        });
      }
    };

    FrameworkSearch.prototype.linkRows = function() {
      var _this;
      _this = this;
      return this.results.find("td").on('click', function() {
        var link;
        link = $(this).parent().attr('data-link');
        if (link.length) {
          return window.location = link;
        }
      });
    };

    return FrameworkSearch;

  })();

  theme.classes.Sections = (function() {
    function Sections() {
      this.unload = bind(this.unload, this);
      this.deselectBlock = bind(this.deselectBlock, this);
      this.selectBlock = bind(this.selectBlock, this);
      this.deselectSection = bind(this.deselectSection, this);
      this.selectSection = bind(this.selectSection, this);
      this.load = bind(this.load, this);
      this.getActiveBlock = bind(this.getActiveBlock, this);
      this.getActiveSection = bind(this.getActiveSection, this);
      this.listeners = bind(this.listeners, this);
      var _this;
      _this = this;
      _this.listeners();
    }

    Sections.prototype.listeners = function() {
      var _this;
      _this = this;
      _this.load();
      _this.unload();
      _this.selectSection();
      _this.deselectSection();
      _this.selectBlock();
      return _this.deselectBlock();
    };

    Sections.prototype.getActiveSection = function(evt) {
      var _this, active_section;
      _this = this;
      active_section = $(evt.target).find('[data-section-id]');
      return active_section;
    };

    Sections.prototype.getActiveBlock = function(evt) {
      var _this, active_block;
      _this = this;
      active_block = $(evt.target);
      return active_block;
    };

    Sections.prototype.load = function(evt) {
      var _this;
      _this = this;
      return $(document).on('shopify:section:load', function(evt) {
        var active_section;
        theme.utils.loadJsClasses();
        active_section = _this.getActiveSection(evt);
        active_section.triggerHandler("theme:section:load");
        return active_section.find('[data-js-class]').each(function() {
          return $(this).triggerHandler("theme:section:load");
        });
      });
    };

    Sections.prototype.selectSection = function() {
      var _this;
      _this = this;
      return $(document).on('shopify:section:select', function(evt) {
        var active_section;
        active_section = _this.getActiveSection(evt);
        return active_section.triggerHandler("theme:section:select");
      });
    };

    Sections.prototype.deselectSection = function() {
      var _this;
      _this = this;
      return $(document).on('shopify:section:deselect', function(evt) {
        var active_section;
        active_section = _this.getActiveSection(evt);
        return active_section.triggerHandler('theme:section:deselect');
      });
    };

    Sections.prototype.selectBlock = function() {
      var _this;
      _this = this;
      return $(document).on('shopify:block:select', function(evt) {
        var active_block;
        active_block = _this.getActiveBlock(evt);
        return active_block.triggerHandler('theme:block:select');
      });
    };

    Sections.prototype.deselectBlock = function() {
      var _this;
      _this = this;
      return $(document).on('shopify:block:deselect', function(evt) {
        var active_block;
        active_block = _this.getActiveBlock(evt);
        return active_block.triggerHandler('theme:block:deselect');
      });
    };

    Sections.prototype.unload = function(evt) {
      var _this;
      _this = this;
      return $(document).on('shopify:section:unload', function(evt) {
        var active_section;
        active_section = _this.getActiveSection(evt);
        active_section.triggerHandler("theme:section:unload");
        return active_section.find('[data-js-loaded="true"]').each(function() {
          return $(this).triggerHandler("theme:section:unload");
        });
      });
    };

    return Sections;

  })();

  theme.classes.FrameworkSlider = (function() {
    function FrameworkSlider(container1) {
      this.container = container1;
      this.eventListeners = bind(this.eventListeners, this);
      this.alignPlayButton = bind(this.alignPlayButton, this);
      this.updateContextMenu = bind(this.updateContextMenu, this);
      this.autoplay = bind(this.autoplay, this);
      this.formatPaginationNumbers = bind(this.formatPaginationNumbers, this);
      this.getActiveIndex = bind(this.getActiveIndex, this);
      this.createSlider = bind(this.createSlider, this);
      this.autoplay_enabled = this.container.data('autoplay') ? true : false;
      this.navigation = this.container.data('navigation') ? true : false;
      this.pagination_numbers = this.container.data('pagination-numbers') ? true : false;
      this.autoplay_frequency = 3000;
      this.slide_length = this.container.children().length;
      this.active_index = 0;
      this.news_panel = this.container.data('news-panel') ? true : false;
      this.createSlider();
      this.eventListeners();
      this.owl = this.container.data('owlCarousel');
    }

    FrameworkSlider.prototype.createSlider = function() {
      var _this, slider;
      _this = this;
      slider = this.container.owlCarousel({
        singleItem: true,
        navigation: _this.navigation,
        navigationText: false,
        pagination: _this.container.data('pagination') ? true : false,
        paginationNumbers: _this.pagination_numbers,
        scrollPerPageNav: true,
        slideSpeed: 800,
        autoHeight: false,
        autoPlay: _this.autoplay(),
        afterInit: function() {},
        afterAction: function() {
          _this.alignPlayButton();
          _this.active_index = _this.getActiveIndex();
          _this.updateContextMenu(_this.active_index);
          return _this.formatPaginationNumbers();
        }
      });
      if (_this.navigation) {
        slider.find('.owl-prev').html(theme.utils.addSymbol('chevron-left'));
        slider.find('.owl-next').html(theme.utils.addSymbol('chevron-right'));
      }
      return slider;
    };

    FrameworkSlider.prototype.getActiveIndex = function() {
      return this.container.find('.owl-pagination .owl-page.active').index();
    };

    FrameworkSlider.prototype.formatPaginationNumbers = function() {
      return this.container.find('.owl-page.active .owl-numbers').text((this.active_index + 1) + "/" + this.slide_length);
    };

    FrameworkSlider.prototype.autoplay = function() {
      if (this.autoplay_enabled) {
        return this.autoplay_frequency;
      }
      return false;
    };

    FrameworkSlider.prototype.updateContextMenu = function(index) {
      var context_navigation, type_class;
      if (this.news_panel) {
        type_class = '.' + this.container.find('.slide').eq(index).data('feed-type');
        context_navigation = this.container.closest('.template--index--news').find('.context-navigation');
        context_navigation.find('.item').hide();
        return context_navigation.find(type_class).show();
      }
    };

    FrameworkSlider.prototype.alignPlayButton = function() {
      var play_button, slide;
      slide = this.container.find('.owl-item').eq(this.active_index);
      play_button = slide.find('.play-button');
      if (play_button.length === 0) {
        return;
      }
      play_button.css('visibility', 'hidden');
      if (PAGE.hasClass('transparent-menu') && $('.main-header').css('position') === 'absolute') {
        slide.find('img').first().imagesLoaded(function() {
          var play_button_height, slide_height, video_offset;
          slide_height = slide.outerHeight();
          play_button_height = play_button.outerHeight();
          video_offset = (slide_height - play_button_height) / 2;
          return play_button.css({
            'margin-top': 0,
            'top': video_offset
          });
        });
      } else {
        play_button.css({
          'margin-top': '-40px',
          'top': '50%'
        });
      }
      return play_button.css('visibility', 'visible');
    };

    FrameworkSlider.prototype.eventListeners = function() {
      var _this;
      _this = this;
      this.container.find(".play-button").on('click', function() {
        var video_modal;
        video_modal = new VideoModal($(this).closest('.video'));
        video_modal.open();
        _this.owl.stop();
        return false;
      });
      return this.container.find('.owl-pagination .owl-page, .skip-to-next').on('click', function() {
        _this.owl.next();
        return false;
      });
    };

    return FrameworkSlider;

  })();

  theme.classes.FrameworkStickyColumn = (function() {
    function FrameworkStickyColumn(container1, column_a1, column_b1, mq) {
      this.container = container1;
      this.column_a = column_a1;
      this.column_b = column_b1;
      this.mq = mq;
      this.Listeners = bind(this.Listeners, this);
      this.setColumnPosition = bind(this.setColumnPosition, this);
      this.getAlignment = bind(this.getAlignment, this);
      this.getState = bind(this.getState, this);
      this.resetLargerColumn = bind(this.resetLargerColumn, this);
      this.getSmallerColumn = bind(this.getSmallerColumn, this);
      this.heightsHaveChanged = bind(this.heightsHaveChanged, this);
      this.setHeights = bind(this.setHeights, this);
      this.loadColumns = bind(this.loadColumns, this);
      if (Modernizr.touch) {
        return false;
      }
      this.current_state = 'auto';
      this.column_a_height = 0;
      this.column_b_height = 0;
      this.loadColumns();
    }

    FrameworkStickyColumn.prototype.loadColumns = function() {
      var _this;
      _this = this;
      return _this.container.imagesLoaded(function() {
        _this.Listeners();
        return _this.setColumnPosition();
      });
    };

    FrameworkStickyColumn.prototype.setHeights = function() {
      this.column_a_height = this.column_a.outerHeight();
      return this.column_b_height = this.column_b.outerHeight();
    };

    FrameworkStickyColumn.prototype.heightsHaveChanged = function() {
      if (this.column_a.outerHeight() !== this.column_a_height) {
        this.setHeights();
        return true;
      }
      if (this.column_b.outerHeight() !== this.column_b_height) {
        this.setHeights();
        return true;
      }
      return false;
    };

    FrameworkStickyColumn.prototype.getSmallerColumn = function() {
      if (this.column_a_height < this.column_b_height) {
        return this.column_a;
      } else {
        return this.column_b;
      }
    };

    FrameworkStickyColumn.prototype.resetLargerColumn = function() {
      if (this.column_a_height > this.column_b_height) {
        return this.column_a.css({
          'position': 'relative',
          'top': 'auto',
          'bottom': 'auto'
        });
      } else {
        return this.column_b.css({
          'position': 'relative',
          'top': 'auto',
          'bottom': 'auto'
        });
      }
    };

    FrameworkStickyColumn.prototype.getState = function(scroll_pos, window_height, column) {
      var column_height, height_for_bottom, overflowing_column, state;
      state = 'auto';
      if (this.mq.current_window === 'small') {
        return 'auto';
      }
      column_height = column.outerHeight();
      if (window_height > column_height) {
        overflowing_column = true;
      }
      if (scroll_pos < this.container.offset().top) {
        state = 'auto';
      }
      if (overflowing_column) {
        height_for_bottom = column_height;
      } else {
        height_for_bottom = window_height;
      }
      if ((scroll_pos + height_for_bottom) > (this.container.offset().top + this.container.outerHeight())) {
        state = 'absolute-bottom';
      } else if (scroll_pos > this.container.offset().top && overflowing_column) {
        state = 'fixed-top';
      } else if (window_height < column_height && (scroll_pos + window_height) > (this.container.offset().top + column.outerHeight())) {
        state = 'fixed-bottom';
      }
      return state;
    };

    FrameworkStickyColumn.prototype.getAlignment = function(column) {
      if (column.hasClass('column-a')) {
        return 'left';
      } else if (column.hasClass('column-b')) {
        return 'right';
      }
    };

    FrameworkStickyColumn.prototype.setColumnPosition = function() {
      var _this, align, column, state;
      _this = this;
      _this.setHeights();
      column = _this.getSmallerColumn();
      state = _this.getState($(window).scrollTop(), $(window).height(), column);
      align = _this.getAlignment(column);
      if (state === 'auto' && this.current_state !== 'auto') {
        this.current_state = 'auto';
        column.css({
          'position': 'relative',
          'top': 'auto',
          'bottom': 'auto'
        });
      } else if (state === 'fixed-bottom' && this.current_state !== 'fixed-bottom') {
        this.current_state = 'fixed-bottom';
        column.css({
          'position': 'fixed',
          'top': 'auto',
          'bottom': 0
        });
      } else if (state === 'fixed-top' && this.current_state !== 'fixed-top') {
        this.current_state = 'fixed-top';
        column.css({
          'position': 'fixed',
          'top': 0,
          'bottom': 'auto'
        });
      } else if (state === 'absolute-bottom' && this.current_state !== 'absolute-bottom') {
        this.current_state = 'absolute-bottom';
        column.css({
          'position': 'absolute',
          'top': 'auto',
          'bottom': 0
        });
      }
      if (align === 'right') {
        return column.css({
          'right': 0
        });
      }
    };

    FrameworkStickyColumn.prototype.Listeners = function() {
      var _this;
      _this = this;
      $(window).scroll(function() {
        return _this.setColumnPosition();
      });
      setInterval(function() {
        if (_this.heightsHaveChanged()) {
          _this.resetLargerColumn();
          return _this.setColumnPosition();
        }
      }, 250);
      return $(window).resize(function() {
        _this.resetLargerColumn();
        return _this.setColumnPosition();
      });
    };

    return FrameworkStickyColumn;

  })();

  theme.classes.Popup = (function() {
    function Popup(root) {
      var _this;
      this.root = root;
      _this = this;
      _this.container = _this.root.find('.popup--container');
      _this.open_link = $('.popup--open');
      _this.close_link = _this.root.find('.popup--close');
      _this.show_again_after = _this.root.data('show-again-after');
      _this.mode = _this.root.data('mode');
      _this.newsletter_form = _this.root.find('#contact_form');
      _this.body = $('body');
      _this.eventListeners();
      _this.autoPopup();
    }

    Popup.prototype.eventListeners = function() {
      var _this;
      _this = this;
      _this.open_link.on('keypress.Popup, click.Popup', function(e) {
        if (_this.body.hasClass('popup--opened')) {
          _this.close();
        } else {
          _this.open();
        }
        return false;
      });
      _this.close_link.on('keypress.Popup, click.Popup', function(e) {
        _this.close();
        return false;
      });
      return _this.newsletter_form.on('submit', function(event) {
        var form, form_dom;
        form_dom = this;
        form = $(this);
        form.find('.error, .success').remove();
        event.preventDefault();
        if (form.find('input[type="email"]').val().length === 0) {
          form.prepend('<p class="error">' + theme.translations.mailing_list_email_blank + '</p>');
          return false;
        } else {
          form.find('input[type="email"], input[type="submit"]').hide();
          form.prepend('<p class="success">' + theme.translations.mailing_list_success_message + '</p>').show();
          setTimeout(function() {
            return form_dom.submit();
          }, 500);
        }
        return false;
      });
    };

    Popup.prototype.open = function(source) {
      var _this;
      _this = this;
      _this.container.removeClass('popup--closed');
      _this.container.velocity({
        translateY: [0, _this.container.outerHeight()]
      }, {
        duration: 300
      });
      _this.body.addClass('popup--opened');
      if (!(theme.home_auto_scroll && $('.template--index').length)) {
        return setTimeout(function() {
          return _this.body.css('padding-bottom', _this.container.outerHeight());
        }, 300);
      }
    };

    Popup.prototype.delayUntilValidScrollPosition = function() {
      var _this;
      _this = this;
      return $(window).on("DOMMouseScroll.Popup mousewheel.Popup touchmove.Popup scroll.Popup touchmove.Popup", function(e) {
        var header_offset, scroll_top;
        header_offset = $('.header').offset().top;
        scroll_top = $(window).scrollTop();
        if (scroll_top > header_offset) {
          _this.open();
          return $(window).off("DOMMouseScroll.Popup mousewheel.Popup touchmove.Popup scroll.Popup touchmove.Popup");
        }
      });
    };

    Popup.prototype.close = function() {
      var _this;
      _this = this;
      _this.body.removeClass('popup--opened');
      _this.body.velocity({
        paddingBottom: 0
      }, {
        duration: 300
      });
      return _this.container.velocity({
        translateY: [_this.container.outerHeight(), 0]
      }, {
        duration: 300,
        complete: function() {
          return _this.container.addClass('popup--closed');
        }
      });
    };

    Popup.prototype.autoPopup = function() {
      var _this;
      _this = this;
      if (_this.mode === 'manual') {
        return;
      }
      if (!Modernizr.localstorage || _this.mode === 'test') {
        return setTimeout(function() {
          return _this.open('auto');
        }, 1000);
      } else if (localStorage['troop-themes'] === void 0) {
        _this.setResetTime();
        return setTimeout(function() {
          return _this.open('auto');
        }, 1000);
      } else if (_this.readyToReset()) {
        _this.setResetTime();
        return setTimeout(function() {
          return _this.open('auto');
        }, 1000);
      }
    };

    Popup.prototype.readyToReset = function() {
      var _this, expires, now, troop_local_storage;
      _this = this;
      troop_local_storage = JSON.parse(localStorage['troop-themes']);
      expires = troop_local_storage.popup_expires;
      now = new Date().getTime();
      if (parseFloat(expires - now) <= 0) {
        _this.setResetTime();
        return true;
      }
      return false;
    };

    Popup.prototype.setResetTime = function() {
      var _this, date, expires, object, seconds_from_now;
      _this = this;
      date = new Date();
      seconds_from_now = 1000 * 60 * 60 * 24 * _this.show_again_after;
      expires = date.setTime(date.getTime() + seconds_from_now);
      object = {
        popup_expires: expires
      };
      localStorage['troop-themes'] = JSON.stringify(object);
      return _this;
    };

    return Popup;

  })();

  theme.classes.Footer = (function() {
    function Footer(container1) {
      var _this;
      this.container = container1;
      _this = this;
      if ($('body.template--index').length) {
        _this.container.on('theme:section:select', function() {
          return theme.PartialFullScreenPanels.goToPanel('end');
        });
      }
    }

    return Footer;

  })();

  theme.classes.PartialFullScreenPanels = (function() {
    function PartialFullScreenPanels(container1, fw_media_queries1) {
      var _this;
      this.container = container1;
      this.fw_media_queries = fw_media_queries1;
      this.onKeyDown = bind(this.onKeyDown, this);
      this.goToPanel = bind(this.goToPanel, this);
      this.accelerationState = bind(this.accelerationState, this);
      this.newScrollDetected = bind(this.newScrollDetected, this);
      this.autoScrollHandler = bind(this.autoScrollHandler, this);
      this.autoScrollDisableEvents = bind(this.autoScrollDisableEvents, this);
      this.autoScrollEnableEvents = bind(this.autoScrollEnableEvents, this);
      this.fullscreenMode = bind(this.fullscreenMode, this);
      this.setPanelHeights = bind(this.setPanelHeights, this);
      this.sectionListeners = bind(this.sectionListeners, this);
      this.init = bind(this.init, this);
      this.detectReset = bind(this.detectReset, this);
      _this = this;
      _this.wrapper = _this.container.find('.panel-wrapper');
      _this.header_offset = $('.layout--header').outerHeight();
      _this.delta = 0;
      _this.active_index = 1;
      _this.window_height = null;
      _this.scrollings = [];
      _this.prev_time = new Date().getTime();
      _this.prev_acceleration_state = 'decel';
      _this.events_enabled = false;
      _this.scroll_detection_active = false;
      _this.time_last_scrolled = 0;
      _this.browser_type = null;
      _this.mouse_type = null;
      _this.detectReset();
      _this.init();
      _this.sectionListeners();
    }

    PartialFullScreenPanels.prototype.detectReset = function() {
      var _this;
      _this = this;
      return $(window).on('resize', function() {
        return _this.init();
      });
    };

    PartialFullScreenPanels.prototype.init = function() {
      var _this;
      _this = this;
      _this.panels = _this.container.find('.fullscreen-panel');
      _this.window_height = $(window).height() - parseInt($('html').css('padding-top'));
      _this.setPanelHeights();
      if (theme.home_auto_scroll && $('html').hasClass('no-touch') && _this.panels.length > 1 && _this.fullscreenMode()) {
        $('html').addClass('auto-scroll');
        _this.container.outerHeight(_this.window_height);
        _this.autoScrollEnableEvents();
        this.scroll_state = 'decel';
        _this.goToPanel(_this.active_index, 0);
      } else {
        $('html').removeClass('auto-scroll');
        _this.container.outerHeight("auto");
        _this.autoScrollDisableEvents();
      }
      return _this.previously_loaded = true;
    };

    PartialFullScreenPanels.prototype.sectionListeners = function() {
      var MutationObserver, _this, config, observer, target;
      _this = this;
      target = $('.partial--fullscreen-panels .panel-wrapper')[0];
      if (window.MutationObserver || window.WebKitMutationObserver) {
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
              _this.goToPanel($(mutation.addedNodes).index() + 1, 0);
            }
          });
        });
        config = {
          attributes: false,
          childList: true,
          characterData: false
        };
        observer.observe(target, config);
      }
      $(document).on('shopify:section:select shopify:section:load', function(evt) {
        var active_section;
        active_section = theme.sections.getActiveSection(evt);
        _this.setPanelHeights();
        return _this.goToPanel(active_section.parent().index() + 1);
      });
      return $(document).on('shopify:section:unload', function(evt) {
        return _this.goToPanel(1, 0);
      });
    };

    PartialFullScreenPanels.prototype.setPanelHeights = function() {
      var _this, height, panel_full_height, panels, window_aspect_ratio;
      _this = this;
      panels = _this.container.find('.fullscreen-panel');
      window_aspect_ratio = _this.window_height / $(window).width();
      panel_full_height = _this.window_height - _this.header_offset;
      height = null;
      if (_this.fw_media_queries.current_window === 'small') {
        if (window_aspect_ratio > 1.5) {
          height = $(window).width() * 1.5;
        } else if (_this.window_height < 527) {
          height = 528;
        } else {
          height = panel_full_height;
        }
      } else {
        if (_this.fullscreenMode()) {
          height = panel_full_height;
        } else {
          height = 800;
        }
      }
      return panels.each(function(index) {
        if (index + 1 === panels.length && _this.fullscreenMode()) {
          height += _this.header_offset;
          height -= $('.layout--footer').outerHeight();
        }
        return $(this).outerHeight(height);
      });
    };

    PartialFullScreenPanels.prototype.fullscreenMode = function() {
      var _this, panel_full_height, window_aspect_ratio;
      _this = this;
      window_aspect_ratio = _this.window_height / $(window).width();
      panel_full_height = _this.window_height - $('.layout--header').outerHeight();
      if (window_aspect_ratio > .5 && window_aspect_ratio < .9 && _this.fw_media_queries.current_window !== 'small') {
        return true;
      } else {
        return false;
      }
    };

    PartialFullScreenPanels.prototype.autoScrollEnableEvents = function() {
      var _this;
      _this = this;
      if (_this.events_enabled) {
        return false;
      }
      _this.events_enabled = true;
      $(window).on("DOMMouseScroll.PartialFullScreenPanels mousewheel.PartialFullScreenPanels", function(e) {
        return _this.autoScrollHandler(e);
      });
      return $(document).on("keydown.PartialFullScreenPanels", function(e) {
        return _this.onKeyDown(e);
      });
    };

    PartialFullScreenPanels.prototype.autoScrollDisableEvents = function() {
      var _this;
      _this = this;
      if (!_this.events_enabled) {
        return false;
      }
      _this.events_enabled = false;
      $(window).off("DOMMouseScroll.PartialFullScreenPanels mousewheel.PartialFullScreenPanels");
      return $(document).off("keydown.PartialFullScreenPanels");
    };

    PartialFullScreenPanels.prototype.autoScrollHandler = function(e) {
      var _this, delta, horizontalDetection, isScrollingVertically, value;
      _this = this;
      e = e.originalEvent;
      if (typeof e.wheelDelta !== 'undefined') {
        value = e.wheelDelta;
        _this.browser_type = 'webkit';
      } else if (typeof e.detail !== 'undefined') {
        value = -e.detail;
        _this.browser_type = 'firefox';
      }
      delta = Math.max(-1, Math.min(1, value));
      if (_this.scrollings.length > 149) {
        _this.scrollings.shift();
      }
      _this.scrollings.push(Math.abs(value));
      horizontalDetection = typeof e.wheelDeltaX !== 'undefined' || typeof e.deltaX !== 'undefined';
      isScrollingVertically = Math.abs(e.wheelDeltaX) < Math.abs(e.wheelDelta) || Math.abs(e.deltaX) < Math.abs(e.deltaY) || !horizontalDetection;
      if (isScrollingVertically) {
        if (_this.newScrollDetected()) {
          if (delta < 0) {
            return _this.goToPanel(_this.active_index + 1);
          } else {
            return _this.goToPanel(_this.active_index - 1);
          }
        }
      }
    };

    PartialFullScreenPanels.prototype.newScrollDetected = function() {
      var _this, acceleration_state, cur_time, scrolled_recently;
      _this = this;
      cur_time = new Date().getTime();
      acceleration_state = _this.accelerationState();
      scrolled_recently = cur_time - _this.time_last_scrolled < 500;
      if (!acceleration_state) {
        return false;
      } else if (acceleration_state === 'accel' && _this.prev_acceleration_state === 'decel' && !scrolled_recently) {
        _this.prev_acceleration_state = acceleration_state;
        return true;
      } else {
        _this.prev_acceleration_state = acceleration_state;
        return false;
      }
    };

    PartialFullScreenPanels.prototype.accelerationState = function() {
      var _this, accel_state, average_end, average_middle, cur_time, getAverage, time_diff;
      _this = this;
      cur_time = new Date().getTime();
      time_diff = cur_time - _this.prev_time;
      _this.prev_time = cur_time;
      if (time_diff > 50) {
        _this.scrollings = [_this.scrollings[_this.scrollings.length - 1]];
        _this.prev_acceleration_state = 'decel';
      }
      getAverage = function(elements, number) {
        var i, lastElements, sum;
        sum = 0;
        lastElements = elements.slice(elements.length - number);
        i = 0;
        while (i < lastElements.length) {
          sum = sum + lastElements[i];
          i++;
        }
        return sum / number;
      };
      average_middle = getAverage(_this.scrollings, Math.ceil(_this.scrollings.length * 0.5));
      average_end = getAverage(_this.scrollings, Math.ceil(_this.scrollings.length * 0.05));
      accel_state = 'decel';
      if (_this.scrollings.length > 1) {
        if (_this.scrollings[0] === 120) {
          accel_state = 'accel';
        } else if (_this.scrollings.length === 2) {
          if (_this.scrollings[0] === 1 && _this.scrollings[1] === 1) {
            accel_state = 'accel';
          }
        } else if (average_end > average_middle) {
          accel_state = 'accel';
        }
      }
      return accel_state;
    };

    PartialFullScreenPanels.prototype.goToPanel = function(index, duration) {
      var _this, offset, panels;
      if (duration == null) {
        duration = 1000;
      }
      _this = this;
      panels = _this.container.find('.fullscreen-panel');
      if (index === 'end') {
        index = panels.length;
      }
      if (index < 1) {
        return false;
      }
      if (index > panels.length) {
        return false;
      }
      _this.time_last_scrolled = new Date().getTime();
      _this.active_index = index;
      offset = (_this.window_height - _this.header_offset) * (index - 1);
      return _this.wrapper.velocity("stop", true).velocity({
        translateY: "-" + offset
      }, {
        duration: duration,
        easing: "ease"
      });
    };

    PartialFullScreenPanels.prototype.onKeyDown = function(e) {
      var _this;
      _this = this;
      switch (e.which) {
        case 38:
        case 33:
          _this.goToPanel(_this.active_index - 1);
          break;
        case 32:
          _this.goToPanel(_this.active_index + 1);
          break;
        case 40:
        case 34:
          _this.goToPanel(_this.active_index + 1);
          break;
        case 36:
          _this.goToPanel(1);
          break;
        case 35:
          _this.goToPanel(panels.length);
          break;
        default:
          return;
      }
    };

    return PartialFullScreenPanels;

  })();

  theme.classes.Header = (function() {
    function Header(container1) {
      var _this;
      this.container = container1;
      this.load = bind(this.load, this);
      _this = this;
      _this.load();
    }

    Header.prototype.load = function() {
      var _this;
      _this = this;
      new theme.classes.FrameworkCart(_this.container.find('.fw--cart.modal--content'), theme.utils.mqs);
      _this.container.find('.fw--align--right').each(function() {
        return new FrameworkAlign($(this), 'right');
      });
      if ($('.modal.window').css('display') === 'block') {
        return $('.modal.window .close').trigger('click');
      }
    };

    return Header;

  })();

  theme.classes.PartialMainMenu = (function() {
    function PartialMainMenu(container1) {
      this.container = container1;
      this.markActive = bind(this.markActive, this);
      this.slideUp = bind(this.slideUp, this);
      this.changeTo = bind(this.changeTo, this);
      this.slideDown = bind(this.slideDown, this);
      this.horizontalListeners = bind(this.horizontalListeners, this);
      this.verticalListeners = bind(this.verticalListeners, this);
      this.subMenuLinks = bind(this.subMenuLinks, this);
      if (this.container.hasClass('vertical')) {
        this.type = 'vertical';
      }
      if (this.container.hasClass('horizontal')) {
        this.type = 'horizontal';
      }
      this.parent_items = this.container.find('.level-1 > .item > a');
      this.sub_menu_links = this.subMenuLinks();
      this.sub_menu_items = this.sub_menu_links.parent().find('ul a');
      this.sub_menu_parents = this.sub_menu_links.parent();
      this.state = 'closed';
      this.sub_menu_panel = this.container.find('.sub_menu_panel');
      this.markActive();
      if (this.type === 'horizontal') {
        this.horizontalListeners();
      } else if (this.type === 'vertical') {
        this.verticalListeners();
      }
    }

    PartialMainMenu.prototype.subMenuLinks = function() {
      var links, links_html;
      links_html = theme.utils.addSymbol('expand-more') + theme.utils.addSymbol('expand-less');
      if (this.type === 'horizontal') {
        links = this.container.find('.level-1 > .item').has('.level-2').find('> a');
        links.addClass('sub-menu-link');
        links.append(links_html);
        return links;
      } else if (this.type === 'vertical') {
        links = this.container.find('.level-1 > .item, .level-2 > .item').has('.level-2, .level-3').find('> a');
        links.addClass('sub-menu-link');
        links.append(links_html);
        return links;
      }
    };

    PartialMainMenu.prototype.verticalListeners = function() {
      var this_class;
      this_class = this;
      return this.sub_menu_links.on('click.PartialMainMenu', function() {
        if ($(this).hasClass('open')) {
          this_class.slideUp($(this));
        } else {
          this_class.slideDown($(this));
        }
        return false;
      });
    };

    PartialMainMenu.prototype.horizontalListeners = function() {
      var _this;
      _this = this;
      this.sub_menu_parents.on('mouseenter.PartialMainMenu touchstart.PartialMainMenu', function(e) {
        if (!$(this).hasClass('open')) {
          e.preventDefault();
        }
        return _this.slideDown($(this));
      });
      this.sub_menu_parents.on('mouseleave.PartialMainMenu', function() {
        return _this.slideUp($(this));
      });
      this.parent_items.on('focus', function(e) {
        _this.container.find('.level-2').hide();
        _this.container.find('.fw--icon--expand-less').hide();
        return _this.container.find('.fw--icon--expand-more').show();
      });
      this.sub_menu_links.on('focus', function(e) {
        _this.slideDown($(this));
        $(this).closest('.item').find('.fw--icon--expand-less').show();
        return $(this).closest('.item').find('.fw--icon--expand-more').hide();
      });
      return this.sub_menu_items.on('touchstart', function(e) {
        return e.stopImmediatePropagation();
      });
    };

    PartialMainMenu.prototype.slideDown = function(link) {
      var sub_menu, this_class;
      this_class = this;
      if (this.type === 'horizontal') {
        this.state = 'open';
        link.addClass('open');
        sub_menu = link.closest('.item').find('.list.level-2');
        return sub_menu.stop(true, true).slideDown(200, function() {
          return {
            'easing': 'easeOutExpo'
          };
        });
      } else if (this.type === 'vertical') {
        link.addClass('open');
        if (link.closest('.list').hasClass('level-1')) {
          sub_menu = link.closest('.item').find('.list.level-2');
        } else if (link.closest('.list').hasClass('level-2')) {
          sub_menu = link.closest('.item').find('.list.level-3');
        }
        return sub_menu.show();
      }
    };

    PartialMainMenu.prototype.changeTo = function(link) {
      var sub_menu, this_class;
      this_class = this;
      sub_menu = this.sub_menu_panel.find('.list.level-2');
      sub_menu.animate({
        opacity: 0
      }, 200);
      this.sub_menu_panel.empty();
      this.container.find('.list > .item > .open').removeClass('open');
      return this.slideDown(link);
    };

    PartialMainMenu.prototype.slideUp = function(link) {
      var sub_menu, this_class;
      this_class = this;
      if (this.type === 'horizontal') {
        link.removeClass('open');
        this.state = 'closed';
        sub_menu = link.parent().find('.list.level-2');
        return sub_menu.fadeOut(200, function() {
          return {
            'easing': 'easeOutExpo'
          };
        });
      } else if (this.type === 'vertical') {
        link.removeClass('open');
        sub_menu = link.closest('.item').find('.list.level-2');
        if (link.closest('.list').hasClass('level-1')) {
          sub_menu = link.closest('.item').find('.list.level-2');
        } else if (link.closest('.list').hasClass('level-2')) {
          sub_menu = link.closest('.item').find('.list.level-3');
        }
        return sub_menu.hide();
      }
    };

    PartialMainMenu.prototype.markActive = function() {
      var this_class, url;
      this_class = this;
      url = window.location.href;
      return this.container.find('a').filter(function() {
        return this.href === url;
      }).addClass('active');
    };

    return PartialMainMenu;

  })();

  theme.classes.CollectionPage = (function() {
    function CollectionPage(container1) {
      var _this;
      this.container = container1;
      this.matchImageHeights = bind(this.matchImageHeights, this);
      this.truncateDescription = bind(this.truncateDescription, this);
      this.positionHeaderText = bind(this.positionHeaderText, this);
      _this = this;
      _this.load();
      _this.eventListeners();
    }

    CollectionPage.prototype.load = function() {
      var _this;
      _this = this;
      _this.positionHeaderText();
      _this.truncateDescription();
      return _this.matchImageHeights();
    };

    CollectionPage.prototype.eventListeners = function() {
      var _this;
      _this = this;
      return $(window).on('resize.TemplateCollection', function() {
        _this.positionHeaderText();
        _this.truncateDescription();
        return _this.matchImageHeights();
      });
    };

    CollectionPage.prototype.positionHeaderText = function() {
      var _this, header_text;
      _this = this;
      header_text = $('.layout--main-content header .text');
      return header_text.css({
        'margin-top': -(header_text.outerHeight() / 2)
      });
    };

    CollectionPage.prototype.truncateDescription = function() {
      $('.featured-product .description iframe').remove();
      return $('.featured-product .description').dotdotdot();
    };

    CollectionPage.prototype.matchImageHeights = function() {
      var greatest_height, grid_items, items_per_row, product_grid, row_items, setRowHeights;
      product_grid = $('.product-grid');
      grid_items = product_grid.find('.partial--product.view--grid');
      row_items = [];
      greatest_height = 0;
      if (product_grid.hasClass('clear-after--medium-2')) {
        items_per_row = 2;
      } else if (product_grid.hasClass('clear-after--medium-3')) {
        items_per_row = 3;
      }
      setRowHeights = function(product_items) {
        $.each(product_items, function() {
          return $(this).find('.image-wrapper').height(greatest_height).find('img:not(.hover-image)').addClass('fw--align--center-y');
        });
        greatest_height = 0;
        return row_items = [];
      };
      if (theme.utils.mqs.current_window === 'small') {
        product_grid.find('.image-wrapper').attr('style', '').find('img').removeClass('fw--align--center-y');
        return false;
      }
      if (items_per_row > 1) {
        return product_grid.imagesLoaded(function() {
          return grid_items.each(function(index) {
            var image;
            image = $(this).find('.image-wrapper img:not(.hover-image)');
            if (image.height() > greatest_height) {
              greatest_height = image.height();
            }
            row_items.push($(this));
            if ((Number(index + 1) % items_per_row === 0) || (index === grid_items.length - 1)) {
              return setRowHeights(row_items);
            }
          });
        });
      }
    };

    return CollectionPage;

  })();

  theme.classes.IndexCollection = (function() {
    function IndexCollection(container1) {
      var _this;
      this.container = container1;
      this.load = bind(this.load, this);
      _this = this;
      _this.load();
    }

    IndexCollection.prototype.load = function() {
      var _this;
      _this = this;
      return _this.container.on('theme:section:load', function() {
        theme.PartialFullScreenPanels.setPanelHeights();
        return $(_this.container.find('.fw--align--fill-y--dynamic')).each(function() {
          return new FrameworkAlign($(this), 'fill-y--dynamic');
        });
      });
    };

    return IndexCollection;

  })();

  theme.classes.IndexFeaturedContent = (function() {
    function IndexFeaturedContent(container1) {
      var _this;
      this.container = container1;
      this.load = bind(this.load, this);
      _this = this;
      _this.load();
    }

    IndexFeaturedContent.prototype.load = function() {
      var _this;
      _this = this;
      return _this.container.on('theme:section:load', function() {
        theme.PartialFullScreenPanels.setPanelHeights();
        return new FrameworkAlign(_this.container.find('.fw--align--fill-y--dynamic'), 'fill-y--dynamic');
      });
    };

    return IndexFeaturedContent;

  })();

  theme.classes.IndexPress = (function() {
    function IndexPress(container1) {
      var _this;
      this.container = container1;
      this.setMaxImageHeight = bind(this.setMaxImageHeight, this);
      this.setLayout = bind(this.setLayout, this);
      this.ellipsis = bind(this.ellipsis, this);
      this.sectionListeners = bind(this.sectionListeners, this);
      this.eventListeners = bind(this.eventListeners, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.section_id = _this.container.data('section_id');
      _this.slider = _this.container.find('.fw--slider');
      _this.slides = _this.slider.find('.slide');
      _this.slide_containers = _this.slides.find('.container');
      _this.load();
      _this.sectionListeners();
      _this.eventListeners();
    }

    IndexPress.prototype.load = function() {
      var _this;
      _this = this;
      theme.PartialFullScreenPanels.setPanelHeights();
      if (theme.utils.mqs.current_window !== 'small') {
        return _this.container.imagesLoaded(function() {
          _this.setLayout();
          _this.setMaxImageHeight();
          return _this.ellipsis();
        });
      }
    };

    IndexPress.prototype.eventListeners = function() {
      var _this;
      _this = this;
      return $(window).on('resize.section-' + _this.section_id, function() {
        if (theme.utils.mqs.current_window !== 'small') {
          _this.setMaxImageHeight();
          return _this.ellipsis();
        }
      });
    };

    IndexPress.prototype.sectionListeners = function() {
      var _this;
      _this = this;
      _this.container.on('theme:section:load', function() {
        return theme.PartialFullScreenPanels.setPanelHeights();
      });
      _this.container.find('[data-block-id]').each(function() {
        return $(this).on('theme:block:select', function(e) {
          var slide_selected;
          slide_selected = _this.slider.find('.slide').index(e.target);
          return _this.slider.trigger('owl.jumpTo', slide_selected).trigger('owl.stop');
        });
      });
      return _this.container.on('theme:section:unload', function() {
        return $(window).off('resize.section-' + _this.section_id);
      });
    };

    IndexPress.prototype.ellipsis = function() {
      var _this;
      _this = this;
      return setTimeout(function() {
        _this.container.find('.fw--ellipsis iframe').remove();
        return _this.container.find('.fw--ellipsis').dotdotdot();
      }, 250);
    };

    IndexPress.prototype.setLayout = function() {
      var _this;
      _this = this;
      return _this.slides.each(function() {
        var column_b, column_c, container, image, layout_type, link, ratio, slide, title;
        slide = $(this);
        container = slide.find('.container.show--medium-large');
        image = container.find('img');
        if (image.length < 1 || theme.utils.mqs.current_window === 'small') {
          return false;
        }
        image.css({
          height: 'auto',
          width: 'auto'
        });
        ratio = image.width() / image.height();
        image.attr('style', '');
        layout_type = null;
        container.removeClass('layout-type--a');
        if (ratio === 0) {
          layout_type = 'b';
        } else if (ratio < 0.76) {
          layout_type = 'a';
        } else if (ratio > 1.24) {
          layout_type = 'b';
        } else {
          layout_type = 'c';
        }
        layout_type = 'layout-type--' + layout_type;
        container.removeClass('layout-type--a layout-type--b layout-type--c');
        container.addClass(layout_type);
        if (layout_type === 'layout-type--c') {
          column_b = container.find('.column-b');
          column_c = container.find('.column-c');
          title = container.find('.title');
          link = container.find('.more-details');
          column_c.prepend(title);
          column_b.append(link);
        }
        return _this;
      });
    };

    IndexPress.prototype.setMaxImageHeight = function() {
      var _this;
      _this = this;
      _this.slide_containers.each(function() {
        var column_a, column_c, container, height, image, image_wrapper, slide;
        container = $(this);
        slide = container.closest('.slide');
        image = container.find('img');
        image_wrapper = image.parent();
        if (image_wrapper.hasClass('placeholder')) {
          image_wrapper = image.parent().parent().parent();
        }
        column_a = container.find('.column-a');
        column_c = container.find('.column-c');
        if (container.hasClass('layout-type--a')) {
          height = slide.height() - parseInt(image_wrapper.css('padding-top')) - parseInt(image_wrapper.css('padding-bottom'));
        } else if (container.hasClass('layout-type--b')) {
          height = slide.height() - parseInt(image_wrapper.css('padding-top')) - parseInt(image_wrapper.css('padding-bottom')) - column_a.outerHeight() - column_c.outerHeight();
        } else if (container.hasClass('layout-type--c')) {
          height = slide.height() - parseInt(image_wrapper.css('padding-top')) - parseInt(image_wrapper.css('padding-bottom')) - image_wrapper.find('.more-details').outerHeight();
        }
        if (image.parent().hasClass('placeholder')) {
          return image.css({
            'max-height': height
          });
        } else {
          return image.css({
            'max-height': height
          });
        }
      });
      return _this;
    };

    return IndexPress;

  })();

  theme.classes.IndexProduct = (function() {
    function IndexProduct(container1) {
      var _this;
      this.container = container1;
      this.eventListeners = bind(this.eventListeners, this);
      this.load = bind(this.load, this);
      _this = this;
      _this.section_id = _this.container.data('section_id');
      _this.load();
      _this.eventListeners();
    }

    IndexProduct.prototype.load = function() {
      var _this;
      _this = this;
      return _this.container.on('theme:section:load', function() {
        theme.PartialFullScreenPanels.setPanelHeights();
        $(_this.container.find('.fw--align--fill-y--dynamic')).each(function() {
          return new FrameworkAlign($(this), 'fill-y--dynamic');
        });
        _this.container.find('.fw--ellipsis iframe').remove();
        return _this.container.find('.fw--ellipsis').dotdotdot();
      });
    };

    IndexProduct.prototype.eventListeners = function() {
      var _this;
      _this = this;
      $(window).on('resize.section-' + _this.section_id, function() {
        if (theme.utils.mqs.current_window === 'small') {
          $(_this.container.find('.fw--align--fill-y--dynamic')).each(function() {
            return new FrameworkAlign($(this), 'fill-y--dynamic');
          });
          return _this.container.find('.fw--ellipsis').dotdotdot();
        }
      });
      return _this.container.on('theme:section:unload', function() {
        return $(window).off('resize.section-' + _this.section_id);
      });
    };

    return IndexProduct;

  })();

  theme.classes.ProductPage = (function() {
    function ProductPage(container1, cart_modal, fw_media_queries1) {
      var _this;
      this.container = container1;
      this.cart_modal = cart_modal;
      this.fw_media_queries = fw_media_queries1;
      this.initiateVariants = bind(this.initiateVariants, this);
      this.variantSelected = bind(this.variantSelected, this);
      this.swapImages = bind(this.swapImages, this);
      this.updateVariantImage = bind(this.updateVariantImage, this);
      this.addProductComplete = bind(this.addProductComplete, this);
      this.renderCart = bind(this.renderCart, this);
      this.addToCartListener = bind(this.addToCartListener, this);
      this.quantityListeners = bind(this.quantityListeners, this);
      this.resizeListeners = bind(this.resizeListeners, this);
      this.copyLink = bind(this.copyLink, this);
      this.fillYRelatedProducts = bind(this.fillYRelatedProducts, this);
      this.resizePanels = bind(this.resizePanels, this);
      this.balanceColumns = bind(this.balanceColumns, this);
      this.indexContentBlocks = bind(this.indexContentBlocks, this);
      this.load = bind(this.load, this);
      _this = this;
      if (_this.container.hasClass('partial--product')) {
        _this.product = _this.container;
      } else {
        _this.product = _this.container.find('.partial--product');
      }
      _this.form = _this.product.find('form.add-to-cart');
      _this.add_button = _this.product.find('button.add');
      _this.compare_price = _this.product.find('.compare-price');
      _this.actual_price = _this.product.find('.actual-price');
      _this.product_unavailable = _this.product.find('.product-unavailable');
      _this.quantity = _this.product.find('.quantity');
      _this.handle = _this.product.data('handle');
      _this.id = _this.product.data('id');
      _this.view = _this.product.data('view');
      _this.load();
    }

    ProductPage.prototype.load = function() {
      var _this;
      _this = this;
      _this.initiateVariants();
      _this.quantityListeners();
      _this.indexContentBlocks();
      _this.copyLink();
      _this.resizePanels();
      _this.balanceColumns();
      _this.resizeListeners();
      if (theme.cart_type === 'modal') {
        _this.addToCartListener();
      }
      return _this.container.on('theme:section:load', function() {
        new Shopify.OptionSelectors('product-select-' + theme.product.id, {
          product: theme.product.json,
          onVariantSelected: _this.variantSelected,
          enableHistoryState: true
        });
        return _this.container.find('.fw--align--right').each(function() {
          return new FrameworkAlign($(this), 'right');
        });
      });
    };

    ProductPage.prototype.indexContentBlocks = function() {
      var content_blocks;
      content_blocks = $('.layout--main-content .product .content .block');
      return content_blocks.each(function(index) {
        return $(this).attr('data-block-index', index);
      });
    };

    ProductPage.prototype.balanceColumns = function() {
      var _this, images;
      _this = this;
      images = $('.layout--main-content .product .content img');
      return images.imagesLoaded(function() {
        var content, content_blocks, image_count, left_side, right_side, single_column;
        content = $('.layout--main-content .product .content');
        single_column = content.find('.single-column');
        content_blocks = content.find('.block');
        left_side = content.find('.left-side');
        right_side = content.find('.right-side');
        image_count = content.find('.photo:not(.hidden-variant-image)').length;
        if (content_blocks.find('iframe').length && theme.utils.mqs.current_window !== 'small' && left_side.children().length) {
          return false;
        }
        content_blocks.sort(function(a, b) {
          return +a.getAttribute('data-block-index') - +b.getAttribute('data-block-index');
        }).appendTo(single_column);
        single_column.show();
        left_side.hide();
        right_side.hide();
        if (image_count > 0 && theme.utils.mqs.current_window !== 'small') {
          content_blocks.each(function(index) {
            var left_height, right_height;
            left_height = left_side.outerHeight();
            right_height = right_side.outerHeight();
            if (left_height <= right_height) {
              return $(this).appendTo(left_side);
            } else {
              return $(this).appendTo(right_side);
            }
          });
          single_column.hide();
          left_side.show();
          return right_side.show();
        }
      });
    };

    ProductPage.prototype.resizePanels = function() {
      var _this;
      _this = this;
      return $('.partial--fullscreen-panel').each(function() {
        var panel_full_height, window_aspect_ratio;
        window_aspect_ratio = $(window).height() / $(window).width();
        panel_full_height = $(window).height() - $('.layout--header').outerHeight();
        if ($(this).hasClass('featured-image')) {
          if (theme.utils.mqs.current_window !== 'small') {
            panel_full_height -= $('.add-to-cart-panel').outerHeight() + 50;
          }
          if ($(this).hasClass('same-color')) {
            panel_full_height += 45;
          }
        }
        if ($(this).hasClass('related-collection')) {
          if (theme.utils.mqs.current_window !== 'small') {
            panel_full_height -= 50;
          }
        }
        if (theme.utils.mqs.current_window === 'small') {
          if (window_aspect_ratio > 1.5) {
            $(this).outerHeight($(window).width() * 1.5);
          } else {
            $(this).outerHeight(panel_full_height);
          }
        } else {
          if (window_aspect_ratio > .5 && window_aspect_ratio < .9) {
            $(this).outerHeight(panel_full_height);
          } else {
            $(this).outerHeight(800);
          }
        }
        if ($(this).hasClass('related-collection')) {
          return _this.fillYRelatedProducts($(this));
        }
      });
    };

    ProductPage.prototype.fillYRelatedProducts = function(container) {
      var _this, header_height, parent_height, slides;
      _this = this;
      parent_height = container.outerHeight();
      header_height = container.find('.header').outerHeight();
      slides = container.find('.slide');
      return slides.each(function() {
        var dynamic_y, fixed_y_height;
        fixed_y_height = $(this).find('.fixed-y').outerHeight();
        dynamic_y = $(this).find('.dynamic-y');
        return dynamic_y.outerHeight(parent_height - header_height - fixed_y_height);
      });
    };

    ProductPage.prototype.copyLink = function() {
      var copy_link, copy_link_textarea;
      copy_link = $('.partial--social-media .copy-link a');
      copy_link_textarea = copy_link.parent().find('textarea');
      copy_link.on('click', function() {
        copy_link_textarea.toggle();
        copy_link_textarea.focus();
        return false;
      });
      return copy_link.parent().find('textarea').on('focus', function() {
        var $this;
        $this = $(this);
        $this.select();
        return $this.on('mouseup', function() {
          $this.unbind("mouseup");
          return false;
        });
      });
    };

    ProductPage.prototype.resizeListeners = function() {
      var _this;
      _this = this;
      return $(window).on('resize.TemplateProduct', function() {
        _this.resizePanels();
        return _this.balanceColumns();
      });
    };

    ProductPage.prototype.quantityListeners = function() {
      var _this;
      _this = this;
      _this.quantity.find('.plus').on('click.PartialProduct', function() {
        var input;
        input = _this.quantity.find('input');
        return input.val(1 + parseInt(input.val()));
      });
      return _this.quantity.find('.minus').on('click.PartialProduct', function() {
        var input;
        input = _this.quantity.find('input');
        if (parseInt(input.val()) > 1) {
          return input.val(parseInt(input.val()) - 1);
        }
      });
    };

    ProductPage.prototype.addToCartListener = function() {
      var _this;
      _this = this;
      if (_this.form.length > 0) {
        return _this.form.submit(function() {
          _this.form.find('p.error').remove();
          _this.add_button.addClass('loading');
          _this.cart_modal.addItem($(this), function(pass, error) {
            if (pass) {
              return _this.renderCart();
            } else {
              _this.form.append('<p class="error">' + error + '</p>');
              return _this.add_button.removeClass('loading');
            }
          });
          return false;
        });
      }
    };

    ProductPage.prototype.renderCart = function() {
      var _this;
      _this = this;
      return _this.cart_modal.renderCart(function() {
        return _this.addProductComplete();
      });
    };

    ProductPage.prototype.addProductComplete = function() {
      var _this;
      _this = this;
      _this.add_button.removeClass('loading');
      return $('.modal.cart-link .modal--link').trigger('click');
    };

    ProductPage.prototype.updateVariantImage = function(variant_id) {
      var _this, featured_image, modal_images, new_featured_image, new_first_modal_image, other_images, product;
      _this = this;
      product = $('.product');
      featured_image = product.find('.featured-image .image-wrapper img');
      other_images = product.find('.content .image-wrapper img');
      modal_images = product.closest('.modal').find('.modal--content img');
      if (variant_id && variant_id !== featured_image.attr('data-image-id')) {
        new_featured_image = other_images.filter('[data-image-id="' + variant_id + '"]');
        new_first_modal_image = modal_images.filter('[data-image-id="' + variant_id + '"]');
        _this.swapImages(featured_image, new_featured_image);
        _this.swapImages(modal_images.first(), new_first_modal_image);
        _this.balanceColumns();
      }
    };

    ProductPage.prototype.swapImages = function(img_1, img_2) {
      var _this;
      _this = this;
      img_1 = {
        elem: img_1,
        src: img_1.attr('src'),
        id: img_1.attr('data-image-id'),
        alt: img_1.attr('alt')
      };
      img_2 = {
        elem: img_2,
        src: img_2.attr('src'),
        id: img_2.attr('data-image-id'),
        alt: img_2.attr('alt')
      };
      img_1.elem.attr('src', img_2.src);
      img_1.elem.attr('data-image-id', img_2.id);
      img_1.elem.attr('alt', img_1.alt);
      img_2.elem.attr('src', img_1.src);
      img_2.elem.attr('data-image-id', img_1.id);
      return img_2.elem.attr('alt', img_1.alt);
    };

    ProductPage.prototype.variantSelected = function(variant, selector, options) {
      var _this, product, product_title, product_variant_size;
      _this = this;
      product = $('#' + selector.domIdPrefix).closest('.partial--product');
      product_variant_size = product.data('variants-size');
      product_title = product.closest('.product').find('.details .title').html();
      _this.compare_price.html("");
      if (variant && variant.available) {
        _this.quantity.show();
        _this.add_button.show();
        _this.product_unavailable.hide();
      } else {
        _this.quantity.hide();
        _this.add_button.hide();
        _this.product_unavailable.show();
        if (product_variant_size > 1 && variant) {
          _this.product_unavailable.find('form .email-body').attr('value', theme.translations.products_sold_out_email_description + ": " + product_title + ' - ' + variant.title);
        }
      }
      if (variant) {
        _this.actual_price.html(Shopify.formatMoney(variant.price, theme.money_format));
        if (variant.compare_at_price > variant.price) {
          _this.compare_price.html(Shopify.formatMoney(variant.compare_at_price, theme.money_format));
        }
        if (theme.currency_switcher_enabled) {
          Currency.convertAll(Currency.shop_currency, Currency.currentCurrency, _this.actual_price, null, true);
          Currency.convertAll(Currency.shop_currency, Currency.currentCurrency, _this.compare_price, null, true);
        }
        if (_this.view === 'product-page') {
          if (variant.featured_image) {
            _this.updateVariantImage(variant.featured_image.id);
          } else {
            _this.updateVariantImage(0);
          }
        }
      }
    };

    ProductPage.prototype.initiateVariants = function(json) {
      var _this, duplicate_exists, history_state, variant_id;
      _this = this;
      if (!$('.template--product').length) {
        variant_id = "product-select-" + _this.id;
        duplicate_exists = false;
        if ($.inArray(variant_id, theme.variant_id_list) === -1) {
          theme.variant_id_list.push(variant_id);
        } else {
          duplicate_exists = true;
          $("#" + variant_id).first().attr("id", variant_id + "--disabled");
        }
        history_state = false;
        if (_this.view === 'product-page') {
          history_state = true;
        }
        if (_this.product.find('select').length > 0) {
          new Shopify.OptionSelectors(variant_id, {
            product: theme.product_json[_this.id],
            onVariantSelected: _this.variantSelected,
            enableHistoryState: history_state
          });
        }
        if (duplicate_exists) {
          return $("#" + variant_id + "--disabled").first().attr("id", variant_id);
        }
      }
    };

    return ProductPage;

  })();

  jQuery(function($) {
    var MAIN, PAGE, checkLogoHeight, copyLink, digitalDownloads, framework_cart_modal, fw_loading_animation, fw_media_queries, isFirefox, resize_timer, stickyFooter, templateArticle;
    PAGE = $('body');
    MAIN = $('.layout--main-content');
    $('.fw--cart-modal--trigger-render span.total-price').addClass('money');
    $('.template--product .partial--product.view--full .actual-price').addClass('money');
    theme.sections = new theme.classes.Sections();
    fw_loading_animation = new theme.classes.FrameworkLoadingAnimation();
    fw_media_queries = new theme.classes.FrameworkMediaQueries();
    theme.utils.mqs = fw_media_queries;
    theme.utils.a11yClick = function(event) {
      var code;
      if (event.type === 'click') {
        return true;
      } else if (event.type === 'keypress') {
        code = event.charCode || event.keyCode;
        if (code === 32) {
          event.preventDefault();
        }
        if (code === 32 || code === 13) {
          return true;
        }
      } else {
        return false;
      }
    };
    theme.utils.addSymbol = function(icon_name) {
      return '<svg class="fw--icon fw--icon--' + icon_name + '"> <use xlink:href="#fw--icon--' + icon_name + '" /> </svg>';
    };
    theme.utils.loadJsClasses = function() {
      return $('[data-js-class]').each(function() {
        var partial_class;
        if ($(this).attr('data-js-loaded') !== 'true') {
          partial_class = theme.classes[$(this).attr('data-js-class')];
          if (typeof partial_class !== "undefined") {
            new partial_class($(this));
            return $(this).attr('data-js-loaded', 'true');
          }
        }
      });
    };
    $('a').each(function() {
      var _this;
      _this = $(this);
      if (this.host === location.host) {
        return _this.attr('target', '_self');
      } else {
        return _this.attr('target', '_blank').attr('rel', 'noopener');
      }
    });
    $('input, textarea').placeholder();
    isFirefox = typeof InstallTrigger !== "undefined";
    if (isFirefox) {
      $('img').addClass('image-scale-hack');
    }
    new theme.classes.FrameworkAnimation();
    framework_cart_modal = new theme.classes.FrameworkCart($('.fw--cart.modal--content'), fw_media_queries);
    $('.fw--align--left').each(function() {
      return new FrameworkAlign($(this), 'left');
    });
    $('.fw--align--center-x').each(function() {
      return new FrameworkAlign($(this), 'center-x');
    });
    $('.fw--align--right').each(function() {
      return new FrameworkAlign($(this), 'right');
    });
    $('.fw--align--top').each(function() {
      return new FrameworkAlign($(this), 'top');
    });
    $('.fw--align--center-y').each(function() {
      return new FrameworkAlign($(this), 'center-y');
    });
    $('.fw--align--bottom').each(function() {
      return new FrameworkAlign($(this), 'bottom');
    });
    $('.partial--popup #mc-embedded-subscribe-form').on('submit', function(event) {
      $('.modal .close').click();
      return true;
    });
    $('.partial--popup #contact_form').on('submit', function(event) {
      var form, modal, wrapper;
      form = this;
      modal = $(this).closest('.partial--popup');
      modal.find('.error, .success').remove();
      wrapper = modal.find('.wrapper');
      event.preventDefault();
      if (modal.find('[type="email"]').val().length === 0) {
        return false;
      } else {
        wrapper.find('*').remove().end().prepend('<p class="success">' + theme.translations.mailing_list_success_message + '</p>').show();
        setTimeout(function() {
          return form.submit();
        }, 500);
      }
      return false;
    });
    if (PAGE.hasClass('template--search')) {
      checkLogoHeight = function() {
        var main;
        main = $('.layout--main-content');
        if ($('.layout--header.logo--height-100').length > 0) {
          return main.css({
            'padding': '100px 50px 0 100px'
          });
        } else if ($('.layout--header.logo--height-75').length > 0) {
          return main.css({
            'padding': '50px 50px 0 100px'
          });
        } else {
          return main.css({
            'padding': '50px 50px 0'
          });
        }
      };
      checkLogoHeight();
      $(document).on('shopify:section:load', function() {
        return checkLogoHeight();
      });
    }
    if (PAGE.hasClass('template--password')) {
      $(document).on('click', '.login-link', function() {
        $(this).css('visibility', 'hidden');
        $('.wrapper').hide();
        $('.login-form').css('visibility', 'visible');
        $('.login-form input[type="password"]').focus();
        return false;
      }).on('click', '.login-form .cancel', function() {
        $('.login-link').css('visibility', 'visible');
        $('.wrapper').fadeIn();
        $('.login-form').css('visibility', 'hidden');
        return false;
      });
      if ($('.login-form .errors').size()) {
        $('.login-link').click();
      }
    }
    if (PAGE.hasClass('template--index')) {
      theme.PartialFullScreenPanels = new theme.classes.PartialFullScreenPanels($('.partial--fullscreen-panels'), fw_media_queries);
    }
    if (PAGE.hasClass('template--product')) {
      theme.product_page = new theme.classes.ProductPage($('.partial--product.view--full'), framework_cart_modal, fw_media_queries);
    }
    if (PAGE.hasClass('template--article')) {
      templateArticle = function() {
        var first_article_img, pinterest_button;
        pinterest_button = $('.share-buttons-list .link--pinterest');
        first_article_img = $('article img').first().attr('src');
        return pinterest_button.attr('href', pinterest_button.attr('href') + '&media=' + first_article_img);
      };
      templateArticle();
      copyLink = function() {
        var copy_link, copy_link_textarea;
        copy_link = $('.partial--social-media .copy-link a');
        copy_link_textarea = copy_link.parent().find('textarea');
        copy_link.on('click', function() {
          copy_link_textarea.toggle();
          copy_link_textarea.focus();
          return false;
        });
        return copy_link.parent().find('textarea').on('focus', function() {
          var $this;
          $this = $(this);
          $this.select();
          return $this.on('mouseup', function() {
            $this.unbind("mouseup");
            return false;
          });
        });
      };
      copyLink();
    }
    digitalDownloads = function() {
      if ($('.sdd-download').length) {
        return $('.sdd-download-button').removeClass('sdd-download-button').css('visibility', 'visible');
      }
    };
    digitalDownloads();
    theme.utils.loadJsClasses();
    resize_timer = null;
    $(window).on('resize', function() {
      clearTimeout(resize_timer);
      return resize_timer = setTimeout(function() {
        return $('.fw--align--fill-y--dynamic').each(function() {
          return new FrameworkAlign($(this), 'fill-y--dynamic');
        });
      }, 250);
    });
    $('#admin_bar_iframe').load(function() {
      var iframe;
      iframe = $('#admin_bar_iframe').contents();
      if (iframe.find('#storefront-bar-minimized').css('display') === 'none') {
        setTimeout(function() {
          $('html').css('padding-top', '40px');
          return theme.PartialFullScreenPanels.init();
        }, 10);
      }
      if (typeof theme.PartialFullScreenPanels !== "undefined") {
        return iframe.find('#close-admin-bar, #show-admin-bar').click(function() {
          return setTimeout(function() {
            return theme.PartialFullScreenPanels.init();
          }, 10);
        });
      }
    });
    $('.fw--align--fill-y--dynamic').each(function() {
      return new FrameworkAlign($(this), 'fill-y--dynamic');
    });
    $('.fw--align--max-img-height').each(function() {
      return new FrameworkAlign($(this), 'max-img-height');
    });
    $('html').addClass('after-js-loaded');
    if (!PAGE.hasClass('template--index')) {
      stickyFooter = function() {
        if ($(window).outerHeight() > $('.fw--off-canvas--main-content').outerHeight()) {
          return $('.layout--main-content').css({
            'min-height': $(window).outerHeight() - $('.layout--footer').outerHeight()
          });
        }
      };
      stickyFooter();
      $(window).resize(function() {
        return stickyFooter();
      });
    }
    return setTimeout(function() {
      return $(".owl-carousel").each(function() {
        return $(this).data('owlCarousel').calculateAll();
      });
    }, 0);
  });

}).call(this);
