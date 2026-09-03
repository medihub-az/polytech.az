/**
 * Front page: hero crossfade slider + reveal-on-scroll.
 * Mirrors the approved design-preview prototype (owner 2026-07-30).
 */
( function () {
	'use strict';

	var hero = document.querySelector( '.mhf-hero' );
	if ( hero ) {
		var slides = Array.prototype.slice.call( hero.querySelectorAll( '.mhf-slide' ) );
		var dotsBox = hero.querySelector( '.mhf-dots' );
		var cur = 0;
		var timer;

		if ( dotsBox ) {
			slides.forEach( function ( _, i ) {
				var b = document.createElement( 'button' );
				b.setAttribute( 'aria-label', 'Slayd ' + ( i + 1 ) );
				b.addEventListener( 'click', function () {
					go( i, true );
				} );
				dotsBox.appendChild( b );
			} );
		}
		var dots = dotsBox ? Array.prototype.slice.call( dotsBox.children ) : [];

		// Backgrounds beyond the first are lazy (data-bg): applied for the
		// current slide and prefetched for the next one, so 13 hero JPEGs
		// don't all download on page load.
		function ensureBg( i ) {
			var s = slides[ ( i + slides.length ) % slides.length ];
			var bg = s && s.querySelector( '.mhf-bg' );
			if ( bg && bg.getAttribute( 'data-bg' ) ) {
				bg.style.backgroundImage = 'url("' + bg.getAttribute( 'data-bg' ) + '")';
				bg.removeAttribute( 'data-bg' );
			}
		}

		function paint() {
			ensureBg( cur );
			ensureBg( cur + 1 );
			slides.forEach( function ( s, i ) {
				s.classList.toggle( 'active', i === cur );
			} );
			dots.forEach( function ( d, i ) {
				d.classList.toggle( 'on', i === cur );
			} );
		}

		function go( i, manual ) {
			cur = ( i + slides.length ) % slides.length;
			paint();
			if ( manual ) {
				restart();
			}
		}

		function restart() {
			clearInterval( timer );
			timer = setInterval( function () {
				go( cur + 1 );
			}, 6500 );
		}

		var prev = hero.querySelector( '.mhf-prev' );
		var next = hero.querySelector( '.mhf-next' );
		if ( prev ) {
			prev.addEventListener( 'click', function () {
				go( cur - 1, true );
			} );
		}
		if ( next ) {
			next.addEventListener( 'click', function () {
				go( cur + 1, true );
			} );
		}
		paint();
		restart();
	}

	if ( 'IntersectionObserver' in window ) {
		var io = new IntersectionObserver(
			function ( entries ) {
				entries.forEach( function ( e ) {
					if ( e.isIntersecting ) {
						e.target.classList.add( 'in' );
						io.unobserve( e.target );
					}
				} );
			},
			{ threshold: 0.12 }
		);
		document.querySelectorAll( '.mhf-rv' ).forEach( function ( el ) {
			io.observe( el );
		} );
	} else {
		document.querySelectorAll( '.mhf-rv' ).forEach( function ( el ) {
			el.classList.add( 'in' );
		} );
	}
} )();
;
document.body.classList.contains("woocommerce-cart")||document.body.classList.contains("woocommerce-checkout")||window.innerWidth<768||!document.getElementById("site-header-cart")||window.addEventListener("load",function(){document.querySelector(".site-header-cart").addEventListener("mouseover",function(){var e=window.outerHeight,t=this.querySelector(".widget_shopping_cart_content").getBoundingClientRect().bottom+this.offsetHeight,o=this.querySelector(".cart_list");e<t&&(o.style.maxHeight="15em",o.style.overflowY="auto")})});
;
document.addEventListener("DOMContentLoaded",function(){if(0!==document.getElementsByClassName("storefront-handheld-footer-bar").length){[].forEach.call(document.querySelectorAll(".storefront-handheld-footer-bar .search > a"),function(t){t.addEventListener("click",function(e){t.parentElement.classList.toggle("active"),e.preventDefault()})});var t=document.getElementsByClassName("storefront-handheld-footer-bar"),n=document.forms,o=function(t){return function(e){t&&-1!==e.target.tabIndex?document.body.classList.add("sf-input-focused"):document.body.classList.remove("sf-input-focused")}};if(t.length&&n.length)for(let e=0;e<n.length;e++)t[0].contains(n[e])||(n[e].addEventListener("focus",o(!0),!0),n[e].addEventListener("blur",o(!1),!0))}});
;
document.addEventListener("DOMContentLoaded",function(){let i=document.getElementsByClassName("brands_index");if(i.length){let n=document.body.classList.contains("admin-bar")?32:0,t=document.getElementById("brands_a_z").scrollHeight,e=i[0].scrollHeight+40,d=function(){768<window.innerWidth&&i[0].getBoundingClientRect().top<0?i[0].style.paddingTop=Math.min(Math.abs(i[0].getBoundingClientRect().top)+20+n,t-e)+"px":i[0].style.paddingTop=0};d(),window.addEventListener("scroll",function(){d()})}});
;
