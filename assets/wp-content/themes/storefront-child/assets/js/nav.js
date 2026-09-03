'use strict';
/* Mobile menu = ONE side sheet, front end and cabinet alike (owner design
   sign-off 2026-08-30, all three mock-ups approved).

   Before this the drawer was a full-width panel dropped under the header:
   the front end flattened to top-level links (children unreachable), the
   cabinet kept an accordion, and NEITHER offered notifications or logout on
   a phone — the floating chip that carries them is desktop-only. The sheet
   fixes all three at once:

     · it slides in from the right over a dimmed page (the page stays
       visible, so it never reads as "the app went away"),
     · every parent row is an accordion whose children open as an inset
       block — one component, both contexts,
     · its bottom is the ACCOUNT ZONE: who you are, «Bildirişlər (N)» and
       «Çıxış» — built from the chip that already exists in the DOM, so
       there is exactly one source of truth for those links.

   The bell in the handheld footer bar (inc/footer.php) is the second half
   of the same decision: notifications one tap away, without the menu. */
( function () {
	var nav = document.querySelector( '.handheld-navigation' );
	if ( ! nav ) {
		return;
	}
	var mainNav = nav.closest( '.main-navigation' );
	if ( ! mainNav ) {
		return;
	}

	// Storefront paints its own carets (li::after, a::after) and ships a
	// .dropdown-toggle; with our ▾ that made two arrows per row. Killed here
	// as well as in style.css so a phone on a stale stylesheet still gets one.
	if ( ! document.getElementById( 'mh-drawer-css' ) ) {
		var css = document.createElement( 'style' );
		css.id = 'mh-drawer-css';
		css.textContent =
			'.handheld-navigation li::after,' +
			'.handheld-navigation li::before,' +
			'.handheld-navigation li > a::after,' +
			'.handheld-navigation li > a::before,' +
			'.handheld-navigation .mh-submenu-toggle::after,' +
			'.handheld-navigation .mh-submenu-toggle::before,' +
			'.handheld-navigation .dropdown-toggle{display:none!important;content:none!important}';
		document.head.appendChild( css );
	}

	// ---------------------------------------------------------- accordion
	nav.querySelectorAll( 'li.menu-item-has-children' ).forEach( function ( li ) {
		if ( li.querySelector( '.mh-submenu-toggle' ) ) {
			return;
		}
		var btn = document.createElement( 'button' );
		btn.type = 'button';
		btn.className = 'mh-submenu-toggle';
		btn.setAttribute( 'aria-label', 'Alt bölmələri aç/bağla' );
		btn.setAttribute( 'aria-expanded', 'false' );
		btn.textContent = '▾';
		btn.addEventListener( 'click', function ( e ) {
			e.preventDefault();
			e.stopPropagation();
			var open = li.classList.toggle( 'mh-open' );
			btn.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
		} );
		li.insertBefore( btn, li.querySelector( 'ul.sub-menu' ) );
	} );

	// ------------------------------------------------------- sheet chrome
	function closeDrawer() {
		mainNav.classList.remove( 'toggled' );
		var toggle = mainNav.querySelector( '.menu-toggle' );
		if ( toggle ) {
			toggle.setAttribute( 'aria-expanded', 'false' );
		}
		sync();
	}

	if ( ! nav.querySelector( '.mh-drawer-head' ) ) {
		var head = document.createElement( 'div' );
		head.className = 'mh-drawer-head';
		var brand = document.querySelector( '.site-branding .custom-logo-link, .site-header .mh-logo' );
		head.innerHTML = brand ? '<span class="mh-drawer-brand">' + brand.innerHTML + '</span>' : '<span class="mh-drawer-brand"></span>';
		var x = document.createElement( 'button' );
		x.type = 'button';
		x.className = 'mh-drawer-x';
		x.setAttribute( 'aria-label', 'Bağla' );
		x.textContent = '✕';
		x.addEventListener( 'click', closeDrawer );
		head.appendChild( x );
		nav.insertBefore( head, nav.firstChild );
	}

	// The account zone, mirrored from the (desktop-only) user chip so the
	// links can never drift apart. No chip = a guest: one way in.
	if ( ! nav.querySelector( '.mh-drawer-foot' ) ) {
		var chip = document.querySelector( '.mh-user-chip' );
		var foot = document.createElement( 'div' );
		foot.className = 'mh-drawer-foot';

		if ( chip ) {
			var nameEl = chip.querySelector( '.mh-user-chip__name' );
			var avaEl = chip.querySelector( '.mh-user-chip__avatar' );
			var homeLink = chip.querySelector( '.mh-user-chip__menu a' );
			var logout = chip.querySelector( '.mh-user-chip__logout' );

			var me = document.createElement( 'a' );
			me.className = 'mh-drawer-me';
			me.href = homeLink ? homeLink.getAttribute( 'href' ) : '#';
			me.innerHTML =
				'<span class="mh-drawer-av">' + ( avaEl ? avaEl.textContent : '' ) + '</span>' +
				'<span class="mh-drawer-id"><span class="mh-drawer-nm"></span>' +
				'<span class="mh-drawer-rl"></span></span>';
			me.querySelector( '.mh-drawer-nm' ).textContent = nameEl ? nameEl.textContent : '';
			me.querySelector( '.mh-drawer-rl' ).textContent = homeLink ? homeLink.textContent.replace( /^[^\wƏĞİÖŞÇÜəğıöşçü]+/, '' ).trim() : '';
			foot.appendChild( me );

			// Notifications: drive the real bell, which owns the polling,
			// the watermark and the mark-as-seen call.
			var notif = document.createElement( 'button' );
			notif.type = 'button';
			notif.className = 'mh-drawer-notif';
			// The word is already on the page, translated, in the handheld
			// footer bell — take it from there rather than keeping a third
			// copy in JavaScript that no language file can reach. Hardcoding
			// it here is why «Bildirişlər» survived every dictionary sweep on
			// /ru (found 2026-08-30).
			var bellLabel = document.querySelector( '.mh-hfb-label' );
			var notifText = bellLabel && bellLabel.textContent.trim()
				? bellLabel.textContent.trim()
				: 'Bildirişlər';
			notif.innerHTML = '🔔 <span class="mh-drawer-notif__t"></span><span class="mh-drawer-notif__c"></span>';
			notif.querySelector( '.mh-drawer-notif__t' ).textContent = notifText;
			notif.addEventListener( 'click', function () {
				var real = document.querySelector( '.mh-bell__btn' );
				closeDrawer();
				if ( real ) {
					real.click();
				}
			} );
			foot.appendChild( notif );

			if ( logout ) {
				var out = document.createElement( 'a' );
				out.className = 'mh-drawer-out';
				out.href = logout.getAttribute( 'href' );
				out.textContent = logout.textContent;
				foot.appendChild( out );
			}
		} else {
			var login = document.createElement( 'a' );
			login.className = 'mh-drawer-login';
			login.href = ( window.mhAccountUrl || '/hesabiniz/' );
			login.textContent = '👤 Daxil ol';
			foot.appendChild( login );
		}
		nav.appendChild( foot );
	}

	// The drawer's own count mirrors the bell badge (same source as the chip).
	( function () {
		var badge = document.querySelector( '.mh-bell__badge' );
		var out = nav.querySelector( '.mh-drawer-notif__c' );
		var btn = nav.querySelector( '.mh-drawer-notif' );
		if ( ! badge || ! out ) {
			return;
		}
		var paint = function () {
			var n = badge.hidden ? '' : ( badge.textContent || '' ).trim();
			out.textContent = n ? ' (' + n + ')' : '';
			if ( btn ) {
				btn.classList.toggle( 'is-lit', !! n );
			}
		};
		new MutationObserver( paint ).observe( badge, { attributes: true, childList: true, characterData: true } );
		paint();
	}() );

	// -------------------------------------------------- backdrop + scroll
	var dim = document.querySelector( '.mh-drawer-dim' );
	if ( ! dim ) {
		dim = document.createElement( 'div' );
		dim.className = 'mh-drawer-dim';
		dim.addEventListener( 'click', closeDrawer );
		document.body.appendChild( dim );
	}

	// The sheet's load-bearing geometry is ALSO applied inline. style.css
	// reaches this site through WP.com's concatenator and can trail a deploy
	// by minutes; the half-applied state is not "the old menu", it is a 60px
	// strip with the list clipped away — worse than either design. Inline
	// !important beats any stylesheet, stale or fresh, and is removed again
	// on close so the desktop layout is never touched.
	var SHEET = {
		position: 'fixed',
		top: '0px',
		right: '0px',
		bottom: '0px',
		left: 'auto',
		width: 'min(82%, 360px)',
		height: 'auto',
		'max-height': 'none',
		'min-height': '0',
		display: 'flex',
		'flex-direction': 'column',
		'overflow-y': 'hidden',
		'z-index': '99996',
		background: '#fff',
		'border-radius': '18px 0 0 18px',
		'box-shadow': '-12px 0 34px rgba(10,26,38,.28)',
	};

	// Where the sheet normally lives, so it can go back on close.
	var homeParent = nav.parentNode;
	var homeNext = nav.nextSibling;

	function phone() {
		return window.matchMedia( '(max-width: 66.4989em)' ).matches;
	}

	function sync() {
		var open = mainNav.classList.contains( 'toggled' );
		document.body.classList.toggle( 'mh-drawer-open', open );

		if ( open && phone() ) {
			// The sheet is MOVED to <body> while it is open. Inside the header
			// it was trapped twice over: an ancestor establishes a containing
			// block for fixed positioning, so top:0/bottom:0 sized the sheet to
			// the HEADER (60px, list clipped away), and .site-header's
			// z-index:1000 stacking context put the whole sheet under the
			// body-level backdrop, so taps hit the dim instead of the menu.
			// Re-parenting removes both at once — no z-index war, no
			// containing-block surprise, and it is what every drawer
			// implementation ends up doing.
			if ( nav.parentNode !== document.body ) {
				document.body.appendChild( nav );
			}
			Object.keys( SHEET ).forEach( function ( k ) {
				nav.style.setProperty( k, SHEET[ k ], 'important' );
			} );
		} else {
			Object.keys( SHEET ).forEach( function ( k ) {
				nav.style.removeProperty( k );
			} );
			if ( nav.parentNode === document.body && homeParent ) {
				homeParent.insertBefore( nav, homeNext );
			}
		}
	}
	window.addEventListener( 'resize', sync );
	// Storefront owns the toggle class; watching it beats guessing which of
	// its handlers ran.
	new MutationObserver( sync ).observe( mainNav, { attributes: true, attributeFilter: [ 'class' ] } );
	document.addEventListener( 'keydown', function ( e ) {
		if ( 'Escape' === e.key && mainNav.classList.contains( 'toggled' ) ) {
			closeDrawer();
		}
	} );
	sync();
} )();

/* Full-bleed sections need the viewport width WITHOUT the scrollbar; 100vw
   includes it and would add a horizontal scroller. Measured once, updated on
   resize. */
( function () {
	function sbw() {
		var w = window.innerWidth - document.documentElement.clientWidth;
		document.documentElement.style.setProperty( '--mh-sbw', ( w > 0 ? w : 0 ) + 'px' );
	}
	sbw();
	window.addEventListener( 'resize', sbw );
	window.addEventListener( 'load', sbw );
} )();

/* Catalog filters drawer (owner 2026-08-01, mobile): the panel is off-canvas
   below 992px; a compact button opens it over half the screen, exactly like
   the marketplace apps. Desktop keeps the panel in the page flow. */
( function () {
	var bar = document.querySelector( '.mh-filterbar' );
	if ( ! bar ) {
		return;
	}

	// The panel is positioned from JS as well as CSS: on staging the open-state
	// rule lost to the closed one no matter how it was written (both live in the
	// same concatenated bundle), so the inline value is what actually moves it.
	function open() {
		document.body.classList.add( 'mh-filters-open' );
		bar.classList.add( 'is-open' );
		if ( window.matchMedia( '(max-width: 991px)' ).matches ) {
			bar.style.left = '0px';
		}
	}
	function close() {
		document.body.classList.remove( 'mh-filters-open' );
		bar.classList.remove( 'is-open' );
		bar.style.left = '';
	}

	// The opener shares the sort row instead of taking a line of its own
	// (owner 2026-08-01: two rows of controls pushed the products down).
	var btn = document.createElement( 'button' );
	btn.type = 'button';
	btn.className = 'mh-filters-btn';
	btn.innerHTML = '<span aria-hidden="true">⚙</span> Filtrlər';
	btn.addEventListener( 'click', open );
	var sorting = document.querySelector( '.site-main > .storefront-sorting' );
	if ( sorting ) {
		sorting.classList.add( 'mh-sorting--with-filters' );
		sorting.appendChild( btn );
	} else {
		var toolbar = document.createElement( 'div' );
		toolbar.className = 'mh-filters-bar';
		toolbar.appendChild( btn );
		bar.parentNode.insertBefore( toolbar, bar );
	}

	// Close control inside the drawer.
	var closeBtn = document.createElement( 'button' );
	closeBtn.type = 'button';
	closeBtn.className = 'mh-filters-close';
	closeBtn.setAttribute( 'aria-label', 'Bağla' );
	closeBtn.textContent = '✕';
	closeBtn.addEventListener( 'click', close );
	bar.insertBefore( closeBtn, bar.firstChild );

	// Tapping the dimmed half of the screen closes it, as does Escape.
	document.addEventListener( 'click', function ( e ) {
		if ( ! document.body.classList.contains( 'mh-filters-open' ) ) {
			return;
		}
		if ( ! bar.contains( e.target ) && e.target !== btn && ! btn.contains( e.target ) ) {
			close();
		}
	} );
	document.addEventListener( 'keydown', function ( e ) {
		if ( 'Escape' === e.key ) {
			close();
		}
	} );
} )();

/* Category prompt: the pulsing stops once the shopper actually engages with
   the control (open, focus or change) — see .is-unset in style.css. */
( function () {
	var item = document.querySelector( '.mh-filterbar__item--cat.is-unset' );
	if ( ! item ) {
		return;
	}
	var select = item.querySelector( 'select' );
	if ( ! select ) {
		return;
	}
	function settle() {
		item.classList.add( 'is-touched' );
	}
	[ 'focus', 'pointerdown', 'change' ].forEach( function ( evt ) {
		select.addEventListener( evt, settle, { once: true } );
	} );
} )();

/* The category picker must always show the page you are on. The server marks
   the right option, but a restored form state (or a stale catalog.js on a
   cached phone) can blank it, so the value is asserted here from the URL. */
( function () {
	var select = document.querySelector( '.mh-filterbar__item--cat select' );
	if ( ! select ) {
		return;
	}
	function assert() {
		if ( select.selectedIndex >= 0 && select.value ) {
			return;
		}
		var here = window.location.origin + window.location.pathname;
		for ( var i = 0; i < select.options.length; i++ ) {
			var value = select.options[ i ].value.replace( /\/$/, '' );
			if ( value === here.replace( /\/$/, '' ) ) {
				select.selectedIndex = i;
				return;
			}
		}
	}
	assert();
	document.addEventListener( 'DOMContentLoaded', assert );
	window.addEventListener( 'pageshow', assert );
} )();

/* The logged-in account chip is position:fixed, so its `top` was a guess that
   only matched one header height — with the admin bar, or at a width where the
   header grows, it floated a row above the menu. Measure the header band and
   centre the chip in it (owner reported this twice). */
( function () {
	var chip = document.querySelector( '.mh-user-chip' );
	var header = document.querySelector( '.site-header' );
	if ( ! chip || ! header ) {
		return;
	}
	function align() {
		var band = header.getBoundingClientRect();
		var h = chip.offsetHeight || 44;
		chip.style.top = Math.max( 4, Math.round( band.top + band.height / 2 - h / 2 ) ) + 'px';
	}
	align();
	window.addEventListener( 'resize', align );
	window.addEventListener( 'scroll', align, { passive: true } );
	window.addEventListener( 'load', align );

	/* Owner 2026-08-05: the dropdown closed the instant the cursor crossed the
	   gap below the button. A hover grace: leaving the chip (or its halo)
	   starts a short timer; re-entering cancels it, so the menu only closes
	   once the cursor has actually moved away. Hover devices only. */
	if ( window.matchMedia && window.matchMedia( '(hover: hover)' ).matches ) {
		var hideTimer = null;
		chip.addEventListener( 'mouseenter', function () {
			if ( hideTimer ) {
				clearTimeout( hideTimer );
				hideTimer = null;
			}
			chip.classList.add( 'is-open' );
		} );
		chip.addEventListener( 'mouseleave', function () {
			hideTimer = setTimeout( function () {
				chip.classList.remove( 'is-open' );
				var focused = document.activeElement;
				if ( focused && chip.contains( focused ) ) {
					focused.blur();
				}
			}, 350 );
		} );
	}
} )();
