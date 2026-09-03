'use strict';
/* Article accordion for «Faydalı məlumatlar» (owner 2026-08-05).
 *
 * One long section, one open article. Opening collapses the others so the
 * page never becomes an endless scroll, and the reader never leaves the
 * page. Panels stay in the DOM (search engines and Ctrl+F see everything);
 * only their visibility changes. Height is animated from the measured
 * content height, then released to `auto` so responsive reflow still works.
 */
( function () {
	var root = document.getElementById( 'mh-acc' );
	if ( ! root ) {
		return;
	}

	var items = Array.prototype.slice.call( root.querySelectorAll( '.mh-acc__item' ) );
	var reduce = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	function panelOf( item ) {
		return item.querySelector( '.mh-acc__panel' );
	}

	function pauseVideos( panel ) {
		panel.querySelectorAll( 'video' ).forEach( function ( v ) {
			v.pause();
		} );
	}

	// Owner 2026-08-06: an article's video starts by itself when the article
	// opens and stops when it closes (or another one opens). Expanding is a
	// click, so unmuted play is allowed; the deep-link auto-open on page load
	// is not a gesture — there the browser rejects play(), and we retry muted.
	function playVideos( panel ) {
		panel.querySelectorAll( 'video' ).forEach( function ( v ) {
			var p = v.play();
			if ( p && p.catch ) {
				p.catch( function () {
					v.muted = true;
					v.play().catch( function () {} );
				} );
			}
		} );
	}

	function collapse( item ) {
		var panel = panelOf( item );
		if ( ! panel || ! item.classList.contains( 'is-open' ) ) {
			return;
		}
		pauseVideos( panel );
		item.classList.remove( 'is-open' );
		item.querySelector( '.mh-acc__btn' ).setAttribute( 'aria-expanded', 'false' );
		if ( reduce ) {
			panel.hidden = true;
			panel.style.height = '';

			return;
		}
		panel.style.height = panel.scrollHeight + 'px';
		// Force a reflow so the browser registers the start height.
		void panel.offsetHeight;
		panel.style.height = '0px';
		window.setTimeout( function () {
			if ( ! item.classList.contains( 'is-open' ) ) {
				panel.hidden = true;
				panel.style.height = '';
			}
		}, 320 );
	}

	function expand( item, scroll ) {
		var panel = panelOf( item );
		if ( ! panel ) {
			return;
		}
		items.forEach( function ( other ) {
			if ( other !== item ) {
				collapse( other );
			}
		} );
		item.classList.add( 'is-open' );
		item.querySelector( '.mh-acc__btn' ).setAttribute( 'aria-expanded', 'true' );
		panel.hidden = false;
		playVideos( panel );
		if ( reduce ) {
			panel.style.height = '';
		} else {
			panel.style.height = '0px';
			void panel.offsetHeight;
			panel.style.height = panel.scrollHeight + 'px';
			window.setTimeout( function () {
				if ( item.classList.contains( 'is-open' ) ) {
					panel.style.height = '';
				}
			}, 320 );
		}
		if ( scroll ) {
			// Keep the opened card's header in view without jumping to the top
			// of the page (the sticky header would otherwise cover it).
			window.setTimeout( function () {
				var top = item.getBoundingClientRect().top + window.pageYOffset - 90;
				window.scrollTo( { top: top, behavior: reduce ? 'auto' : 'smooth' } );
			}, 60 );
		}
	}

	root.addEventListener( 'click', function ( e ) {
		var btn = e.target.closest( '.mh-acc__btn' );
		if ( btn ) {
			var item = btn.closest( '.mh-acc__item' );
			if ( item.classList.contains( 'is-open' ) ) {
				collapse( item );
			} else {
				expand( item, true );
			}

			return;
		}
		var close = e.target.closest( '.mh-acc__close' );
		if ( close ) {
			var openItem = close.closest( '.mh-acc__item' );
			collapse( openItem );
			var top = openItem.getBoundingClientRect().top + window.pageYOffset - 90;
			window.scrollTo( { top: top, behavior: reduce ? 'auto' : 'smooth' } );
		}
	} );

	// Deep links: /…/#slug opens that article (also when the hash changes).
	function openFromHash() {
		var hash = window.location.hash.replace( '#', '' );
		if ( ! hash ) {
			return;
		}
		var target = document.getElementById( hash );
		if ( target && target.classList.contains( 'mh-acc__item' ) ) {
			expand( target, true );
		}
	}
	openFromHash();
	window.addEventListener( 'hashchange', openFromHash );

	// The table of contents drives the accordion instead of jumping.
	var toc = document.querySelector( '.mh-info__toc' );
	if ( toc ) {
		toc.addEventListener( 'click', function ( e ) {
			var a = e.target.closest( 'a[href^="#"]' );
			if ( ! a ) {
				return;
			}
			var target = document.getElementById( a.getAttribute( 'href' ).slice( 1 ) );
			if ( target && target.classList.contains( 'mh-acc__item' ) ) {
				e.preventDefault();
				expand( target, true );
				if ( window.history && window.history.replaceState ) {
					window.history.replaceState( null, '', a.getAttribute( 'href' ) );
				}
			}
		} );
	}
} )();
