/* Copyright (c) 2014 Sigura Brice
 * Licensed under the CreativeCommons License
 */
(function ($) {
    "use strict";

    window.bScrolls = [];

    $.fn.bScroll = function (parameters) {
        if (parameters === undefined) {
            parameters = {};
        }

        function BScroll($target, parameters) {
            this.$target = $target;

            this.dimensions = null;

            this.options = $.extend(true, {
                speed: 20,
                propagate: false,
                events: {
                    arrows: true,
                    mousewheel: true,
                    touchscreen: true,
                    resize: true,
                    lifts: true
                },
                autoupdate: 50
            }, parameters);

            this.needs = {
                x: false,
                y: false
            };

            this.scrolls = {
                x: null,
                y: null
            };

            this.init = function () {
                // Initialisation de la cible $target
                this.initTarget();

                // Initialisation des dimensions
                this.dimensions = this.calculateDimensions();

                // Initialisation des besoins
                this.needs = this.checkNeeds();

                // Création des scrollbars si nécessaire
                this.createScrolls();

                // Placement des scrollbars
                this.placeScrolls();

                // Initialisation des événements
                this.initEvents();
            };

            this.onResize = function (e) {
                // On supprime les scrolls qui existent déjà
                e.data.t.removeScrolls();

                // Initialisation des dimensions
                e.data.t.dimensions = e.data.t.calculateDimensions();

                // Initialisation des besoins
                e.data.t.needs = e.data.t.checkNeeds();

                // Création des scrollbars si nécessaire
                e.data.t.createScrolls();

                // Placement des scrollbars
                e.data.t.placeScrolls();

                // Initialisation des événements
                e.data.t.initEvents();
            };

            this.initEvents = function () {
                // Reset des events
                this.resetEvents();

                // Événement à l'entrée de la souris sur $target
                this.$target.on('mouseenter', {t: this}, this.onMouseEnter);

                // Événement au mouvement de la souris sur $target
                this.$target.on('mousemove', {t: this}, this.onMouseMove);

                // Événements à le sortie de la souris sur $target
                this.$target.on('mouseleave', {t: this}, this.onMouseLeave);

                // Événements molette
                if (this.options.events.mousewheel) {
                    this.$target.on('mousewheel', {t: this}, this.onMouseWheel);
                }

                // Événements clavier
                if (this.options.events.arrows) {
                    this.$target.on('keydown', {t: this}, this.onKeyDown);
                }

                var t = this,
                    supportsTouch = (('ontouchstart' in window) || (window.DocumentTouch && document instanceof window.DocumentTouch)),
                    start = {
                        x: 0,
                        y: 0
                    };

                // Événements touchscreen
                if (this.options.events.arrows) {
                    if (supportsTouch) {

                        this.$target.on('touchstart', {start: start, t: this}, this.onTouchStart);

                        this.$target.on('touchmove', {start: start, t: this}, this.onTouchMove);

                        this.$target.on('touchend', {start: start, t: this}, this.onTouchEnd);
                    }
                }

                // Drag'n Drop lift
                if (this.options.events.lifts) {
                    this.$target.children('.bs-scroll-x, .bs-scroll-y').on('mousedown', {start: start, t: this}, this.onMouseDownLift);
                }

                // Événements lors du redimensionnement de la fenêtre
                if (this.options.events.resize) {
                    $(window).on('resize', {t: this}, this.onResize);
                    this.$target.on('resize', {t: this}, this.onResize);
                }

                if (this.options.autoupdate) {
                    this.intervalChecker = setInterval(function () {
                        var dimensions = t.calculateDimensions(),
                            scrollX = t.scrolls.x,
                            scrollY = t.scrolls.y;
                        if (t.dimensions.scrollWidth !== dimensions.scrollWidth || t.dimensions.scrollHeight !== dimensions.scrollHeight) {
                            if (dimensions.scrollHeight !== t.dimensions.scrollHeight + (scrollX ? scrollX.$scroll.height() : 0) + (scrollY ? scrollY.$scroll.height() : 0) || dimensions.width !== t.dimensions.width) {
                                console.log("resize");
                                t.$target.resize();
                            }
                        }
                    }, this.options.autoupdate);
                }

//                this.$target.on('scroll', function (e) {
//                    t.placeScrolls();
//                });
            };

            this.onMouseEnter = function (e) {
                if (e.data.t.options.events.arrows) {
                    e.data.t.$target.attr('tabindex', 0);
                    e.data.t.$target.focus();
                }
                e.data.t.$target.children(".bs-scroll-x, .bs-scroll-y").show();
                e.preventDefault();
                e.stopPropagation();
            };

            this.onMouseMove = function(e)
            {
                if(e.data.t.options.events.arrows) {
                    e.data.t.$target.attr('tabindex', 0);
                    e.data.t.$target.focus();
                }
                e.data.t.$target.children(".bs-scroll-x, .bs-scroll-y").show();
            };

            this.onMouseLeave = function (e) {
                if (!e.data.t.$target.hasClass('bs-lift-moving')) {
                    if (e.data.t.options.events.arrows) {
                        e.data.t.$target.blur();
                        e.data.t.$target.removeAttr('tabindex');
                    }
                    e.data.t.$target.children(".bs-scroll-x, .bs-scroll-y").hide();
                }
                e.preventDefault();
                e.stopPropagation();
            };

            this.onMouseWheel = function (e) {
                var deltas = {
                    x: e.deltaX !== 0 ? e.deltaX * e.data.t.options.speed : 0,
                    y: e.deltaY !== 0 ? -e.deltaY * e.data.t.options.speed : 0
                };

                e.data.t.scrollTarget(deltas, e);
            };

            this.onKeyDown = function (e) {
                var deltas = {
                    x: 0,
                    y: 0
                };

                if (e.which === 37 && e.data.t.needs.x) { deltas.x = -e.data.t.options.speed; }
                if (e.which === 39 && e.data.t.needs.x) { deltas.x = e.data.t.options.speed; }
                if (e.which === 38 && e.data.t.needs.y) { deltas.y = -e.data.t.options.speed; }
                if (e.which === 40 && e.data.t.needs.y) { deltas.y = e.data.t.options.speed; }

                e.data.t.scrollTarget(deltas, e);
            };

            this.onMouseDownLift = function (e) {
                e.data.t.$target.addClass('bs-lift-moving');

                e.data.start.x = e.pageX;
                e.data.start.y = e.pageY;

                var datas = {
                    start: e.data.start,
                    t: e.data.t,
                    lift: this.className.slice(-1)
                };

                $(window).on('mousemove', datas, e.data.t.onMouseMoveLift);
                $(window).on('mouseup', datas, e.data.t.onMouseUpLift);

                e.preventDefault();
                e.stopPropagation();
            };

            this.onMouseUpLift = function (e) {
                $(window).unbind('mousemove', e.data.t.onMouseMoveLift);
                $(window).unbind('mouseup', e.data.t.onMouseUpLift);
                e.data.start.x = 0;
                e.data.start.y = 0;
                e.data.t.$target.removeClass('bs-lift-moving');
            };

            this.onMouseMoveLift = function (e) {
                var deltas = {
                    x: e.data.lift === 'x' ? (e.pageX - e.data.start.x) * e.data.t.dimensions.scrollWidth / e.data.t.dimensions.outerWidth : 0,
                    y: e.data.lift === 'y' ? (e.pageY - e.data.start.y) * e.data.t.dimensions.scrollHeight / e.data.t.dimensions.outerHeight : 0
                };

                e.data.start.x = e.pageX;
                e.data.start.y = e.pageY;

                e.data.t.scrollTarget(deltas, e);
            };

            this.onTouchStart = function (e) {
                e.data.t.scrolls.x.$scroll.show();
                e.data.t.scrolls.y.$scroll.show();

                var touch = e.originalEvent.targetTouches[0];

                e.data.start.x = touch.pageX;
                e.data.start.y = touch.pageY;
            };

            this.onTouchMove = function (e) {
                var touch = e.originalEvent.targetTouches[0],
                    deltas = {
                        x: e.data.t.options.speed * (e.data.start.x - touch.pageX) / 10,
                        y: e.data.t.options.speed * (e.data.start.y - touch.pageY) / 10
                    };

                e.data.t.scrollTarget(deltas, e);

                e.data.start.x = touch.pageX;
                e.data.start.y = touch.pageY;
            };

            this.onTouchEnd = function (e) {
                e.data.t.scrolls.x.$scroll.hide();
                e.data.t.scrolls.y.$scroll.hide();

                e.data.start.x = 0;
                e.data.start.y = 0;
            };

            this.scrollTarget = function (deltas, e) {
                deltas = this.normalizeDeltas(deltas);

                var diff = navigator.userAgent.match(/OPR\//) ? 1 : 0;

                this.$target.scrollLeft(deltas.x + e.data.t.$target.scrollLeft() + diff);
                this.$target.scrollTop(deltas.y + e.data.t.$target.scrollTop() + diff);

                this.beforePlaceScrolls(deltas, e);

                this.placeScrolls();
            };

            this.beforePlaceScrolls = function (deltas, e) {
                if (deltas.x !== 0 || deltas.y !== 0) {
                    if (this.options.propagate !== "always") {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    e.data.t.placeScrolls();
                } else {
                    if (!this.options.propagate) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            };

            this.normalizeDeltas = function (deltas) {
                if (deltas.x + this.$target.scrollLeft() > this.dimensions.scrollWidth - this.dimensions.outerWidth) { deltas.x = this.dimensions.scrollWidth - this.dimensions.outerWidth - this.$target.scrollLeft(); }
                if (deltas.x + this.$target.scrollLeft() < 0) { deltas.x = -this.$target.scrollLeft(); }
                if (deltas.y + this.$target.scrollTop() > this.dimensions.scrollHeight - this.dimensions.outerHeight) { deltas.y = this.dimensions.scrollHeight - this.dimensions.outerHeight - this.$target.scrollTop(); }
                if (deltas.y + this.$target.scrollTop() < 0) { deltas.y = -this.$target.scrollTop(); }

                return deltas;
            };

            this.resetEvents = function () {
                this.$target.unbind('mousewheel', this.onMouseWheel);
                this.$target.unbind('mouseenter', this.onMouseEnter);
                this.$target.unbind('mousemove', this.onMouseMove);
                this.$target.unbind('mouseleave', this.onMouseLeave);
                this.$target.unbind('keydown', this.onKeyDown);
                this.$target.unbind('touchstart', this.onTouchStart);
                this.$target.unbind('touchmove', this.onTouchMove);
                this.$target.unbind('touchend', this.onTouchEnd);
                this.$target.unbind('resize', this.onResize);
                this.$target.unbind('scroll', this.placeScrolls);
                this.$target.children('.bs-scroll-x, .bs-scroll-y').unbind('mousedown');
                $(window).unbind('mousemove', this.onMouseMoveLift);
                $(window).unbind('mouseup', this.onMouseUpLift);
                $(window).unbind('resize', this.onResize);

                clearInterval(this.intervalChecker);
            };

            this.createScrolls = function () {
                if (this.needs.x) { this.scrolls.x = this.createScroll("x"); }
                if (this.needs.y) { this.scrolls.y = this.createScroll("y"); }
            };

            this.createScroll = function (axe) {
                var $lift = $("<div>"),
                    $scroll = $("<div>");

                $lift.addClass("bs-lift-" + axe)
                    .css({
                        position: "relative"
                    });

                $scroll.addClass("bs-scroll-" + axe)
                    .css({
                        position: "relative"
                    })
                    .append($lift)
                    .appendTo(this.$target);

                this.dimensions.scrolls[axe].offsetTop = $scroll[0].offsetTop;

                return {
                    $scroll: $scroll,
                    $lift: $lift
                };
            };

            this.placeScrolls = function () {
                if (this.needs.x) { this.placeScrollX(); }
                if (this.needs.y) { this.placeScrollY(); }
            };

            this.placeScrollX = function () {
                this.scrolls.x.$scroll.css({
                    width: this.dimensions.outerWidth,
                    left: this.$target.scrollLeft() - this.dimensions.padding.left,
                    top: this.$target.scrollTop() - this.dimensions.scrollHeight + this.dimensions.outerHeight - this.scrolls.x.$scroll.height() + this.dimensions.padding.bottom
                });

                this.placeLiftX();
            };

            this.placeLiftX = function () {
                this.scrolls.x.$lift.css({
                    left: this.$target.scrollLeft() * this.dimensions.outerWidth / this.dimensions.scrollWidth,
                    width: this.scrolls.x.$scroll.width() * this.dimensions.outerWidth / this.dimensions.scrollWidth
                });
            };

            this.placeScrollY = function () {
                this.scrolls.y.$scroll.css({
                    height: this.dimensions.outerHeight,
                    left: this.$target.scrollLeft() - this.dimensions.padding.left + this.dimensions.outerWidth - this.scrolls.y.$scroll.width(),
                    top: this.$target.scrollTop() - this.dimensions.scrollHeight - (this.scrolls.x ? this.scrolls.x.$scroll.height() : 0) + this.dimensions.padding.bottom
                });

                this.placeLiftY();
            };

            this.placeLiftY = function () {
                this.scrolls.y.$lift.css({
                    top: this.$target.scrollTop() * this.dimensions.outerHeight / this.dimensions.scrollHeight,
                    height: this.scrolls.y.$scroll.height() * this.dimensions.outerHeight / this.dimensions.scrollHeight
                });
            };

            this.removeScrolls = function () {
                this.scrolls.x = null;
                this.scrolls.y = null;

                this.$target.children('.bs-scroll-x, .bs-scroll-y').remove();
            };

            this.checkNeeds = function () {
                return {
                    x: this.dimensions.scrollWidth > this.dimensions.outerWidth,
                    y: this.dimensions.scrollHeight > this.dimensions.outerHeight
                };
            };

            this.initTarget = function () {
                this.$target
                    .addClass("bs-container")
                    .css({
                        overflow: "hidden",
                        outline: "none"
                    });
            };

            this.calculateDimensions = function () {
                return {
                    innerWidth: Math.round(this.$target.width()),
                    innerHeight: Math.round(this.$target.height()),
                    outerWidth: Math.round(this.$target.width() + parseInt(this.$target.css('padding-left')) + parseInt(this.$target.css('padding-right'))),
                    outerHeight: Math.round(this.$target.height() + parseInt(this.$target.css('padding-top')) + parseInt(this.$target.css('padding-bottom'))),
                    scrollWidth: this.$target[0].scrollWidth,
                    scrollHeight: this.$target[0].scrollHeight,
                    padding: {
                        top: Math.round(parseInt(this.$target.css('padding-top'))),
                        left: Math.round(parseInt(this.$target.css('padding-left'))),
                        right: Math.round(parseInt(this.$target.css('padding-right'))),
                        bottom: Math.round(parseInt(this.$target.css('padding-bottom')))
                    },
                    scrolls: {
                        x: {
                            offsetTop: 0
                        },
                        y: {
                            offsetTop: 0
                        }
                    }
                };
            };
        }

        if (this.selector === '' && parameters === 'resize') {
            $.each(window.bScrolls, function (key, bScroll) {
                bScroll.resize();
            });
        }

        this.each(function () {
            var $t = $(this),
                bScroll = null;
            if (typeof parameters === 'string') {
                $.each(window.bScrolls, function (key, bScroll) {
                    if (bScroll.$target.context === $t.context) {
                        switch (parameters) {
                        case "resize":
                            bScroll.$target.resize();
                            break;
                        case "destroy":
                            bScroll.destroy();
                            delete window.bScrolls[key];
                            break;
                        }
                    }
                });
            } else {
                bScroll = new BScroll($(this), parameters);

                window.bScrolls.push(bScroll);

                bScroll.init();

                return bScroll;
            }
        });

        return this;
    };
}) (jQuery);