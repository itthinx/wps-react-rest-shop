/**
 * Shop.jsx
 *
 * Copyright (c) 2024 "kento" Karim Rahimpur www.itthinx.com
 *
 * This code is released under the GNU General Public License.
 * See COPYRIGHT.txt and LICENSE.txt.
 *
 * This code is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * This header and all notices must be kept intact.
 *
 * @author Karim Rahimpur
 * @license GPLv3
 */

import { useState } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';

const per_page = 10;

/**
 * Products container component.
 */
function Products( { items } ) {
	return (
		<div className="products">
		{
			items.map(
				item => <Product key={item.id} item={item} />
			)
		}
		</div>
	);
}

/**
 * Product component.
 */
function Product( { item } ) {
	let image = null;

	const permalink = typeof item.permalink !== 'undefined' ? item.permalink : '#';

	// Look for the featured image or use the first one
	image = null;
	if ( item.images !== 'undefined' && Array.isArray( item.images ) && item.images.length > 0 ) {
		for ( let i = 0; i < item.images.length; i++ ) {
			if ( typeof item.images[i].featured !== 'undefined' && item.images[i].featured ) {
				image = item.images[i];
			}
		}
		if ( image === null ) {
			image = item.images[0];
		}
	}

	return(
		<div className="product">
			<div className="image">
				<a href={permalink}>
					<img className="product-featured-image" src={image.src} alt={image.alt} title={image.name} />
				</a>
			</div>
			<div className="name">
				<a href={permalink}>
					{item.name}
				</a>
			</div>
			<div className="price" dangerouslySetInnerHTML={{ __html: item.price_html}}>
			</div>
		</div>
	);
}

/**
 * Categories container component.
 */
function Categories ( { items, handleTermClick, terms } ) {
	return (
		<div className="categories">
		{
			items.map(
				item => <Category key={item.id} item={item} handleTermClick={handleTermClick} terms={terms} />
			)
		}
		</div>
	);
}

/**
 * Cagegory component.
 */
function Category ( { item, handleTermClick, terms } ) {

	function onClick( event ) {
		handleTermClick( item.id );
	}

	let cssClass = "category";

	if ( terms.includes( item.id ) ) {
		cssClass += ' active';
	}

	if ( item.parent ) {
		cssClass += ' child';
	} else {
		cssClass += ' parent';
	}

	return (
		item.count > 0 ?
		<div className={cssClass} onClick={onClick}>
			<span className="name">{item.name}</span> <span className="count">{item.count}</span>
		</div>
		:
		''
	);
}

/**
 * Colors container component.
 */
function Colors ( { items, handleTermClick, terms } ) {
	return (
		<div className="colors">
		{
			items.map(
				item => <Color key={item.id} item={item} handleTermClick={handleTermClick} terms={terms} />
			)
		}
		</div>
	);
}

/**
 * Color component.
 */
function Color ( { item, handleTermClick, terms } ) {

	function onClick( event ) {
		handleTermClick( item.id );
	}

	let cssClass = "color";

	if ( terms.includes( item.id ) ) {
		cssClass += ' active';
	}

	let image = null;

	let img = '';
	if ( item.images !== 'undefined' && Array.isArray( item.images ) && item.images.length > 0 ) {
		image = item.images[0];
		img = <img className="color-image" src={image.src} alt={image.alt} title={image.name} />;
	}

	return (
		<div className={cssClass} onClick={onClick}>
			{img}
			<span className="name">{item.name}</span> <span className="count">{item.count}</span>
		</div>
	);
}

/**
 * Sizes container component.
 */
function Sizes ( { items, handleTermClick, terms } ) {
	return (
		<div className="sizes">
		{
			items.map(
				item => <Size key={item.id} item={item} handleTermClick={handleTermClick} terms={terms} />
			)
		}
		</div>
	);
}

/**
 * Size component.
 */
function Size ( { item, handleTermClick, terms } ) {

	function onClick( event ) {
		handleTermClick( item.id );
	}

	let cssClass = "size";

	if ( terms.includes( item.id ) ) {
		cssClass += ' active';
	}

	return (
		<div className={cssClass} onClick={onClick}>
			<span className="name">{item.name}</span> <span className="count">{item.count}</span>
		</div>
	);
}

/**
 * Prices component.
 */
function Prices ( { minPrice, maxPrice, handlePrices } ) {

	function handleMinPrice( price ) {
		handlePrices( { min : price } );
	}

	function handleMaxPrice( price ) {
		handlePrices( { max : price } );
	}

	return (
		<div className="prices">
			<span className="prices-heading">Price</span>
			<TextInputDelayed id="min-price" delay="500" handleUpdate={handleMinPrice} placeholder="min" />
			&mdash;
			<TextInputDelayed id="max-price" delay="500" handleUpdate={handleMaxPrice} placeholder="max" />
		</div>
	);
}

/**
 * Reset filters.
 */
function Reset( { resetHandler } ) {

	/**
	 * Invoke the reset handler.
	 */
	function handleClick( event ) {
		event.preventDefault();
		resetHandler();
	}

	return (
		<div className="reset">
			<button className="button" name="reset" onClick={handleClick}>Reset</button>
		</div>
	);
}

/**
 * Pagination component.
 *
 * @param int page current page
 * @param int total number of products
 */
function Pagination( { page, total, setPage }) {
	let n = Math.ceil( total / per_page );
	let pages = [];
	for ( let i = 1; i <= n; i++ ) {
		pages.push( { current : page === i, number : i } );
	}
	return (
		<ul>
		{
			pages.map(
				item =>
					<li className={item.current ? 'current' : '' } key={item.number} onClick={ () => { setPage( item.number ); } }>
						{ item.number }
					</li>
			)
		}
		</ul>
	);
}

/**
 * A text input field functional React component that allows to schedule a delayed call to an update handler,
 * so we don't have to react on every single keystroke right when it happens.
 *
 * @param int delay how many milliseconds to wait after the text input has changed before calling the update handler
 * @param function handleUpdate the update handler
 * @param string placeholder text used as placeholder
 * @param string value current value
 * @param string cssClass CSS class to use
 */
function TextInputDelayed( { delay, handleUpdate, placeholder, value, cssClass, id } ) {

	/**
	 * @param object whose current property holds the timeoutID of the currently scheduled timeout
	 */
	const timeout = useRef( null );

	/**
	 * @param array the current state and a set function to update the state based on the text input field
	 */
	const [text, setText] = useState( typeof value !== 'undefined' ? value : '' );

	// Make sure that delay has an appropriate value
	if ( isNaN( delay ) || delay < 0 ) {
		delay = 0;
	} else {
		delay = parseInt( delay );
	}

	/**
	 * Change event handler, for when the input of the text input field changes
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
	 *
	 * @param Event event the change event
	 */
	function handleChange( event ) {

		// Take the input from the text field
		const input = event.target.value;

		// Update the input state
		setText( input );

		// Clear a previously scheduled timeout
		if ( timeout.current !== null ) {
			clearTimeout( timeout.current );
		}

		// Schedule a timeout that calls the update handler if a delay is required
		if ( delay > 0 ) {
			timeout.current = setTimeout(
				() => {
					handleUpdate( input );
				},
				delay
			);
		} else {
			// No delay required, call the update handler now
			handleUpdate( input );
		}
	}

	const className = typeof cssClass !== 'undefined' ? cssClass : 'text-input-delayed';

	document.addEventListener(
		'reset',
		(event) => {
			if ( id === event.detail ) {
				setText( '' );
			}
		}
	);

	// Render a text input field and register the change event handler
	return (
		<input id={id} className={className} type="text" value={text} onChange={handleChange} placeholder={placeholder} />
	);
}

/**
 * Add a trailing slash if there is none.
 * @param string s
 */
function trailingSlash( s ) {
	if ( s.substr( -1 ) !== '/' ) {
		s = s + '/';
	}
	return s;
}

/**
 * Remove an item from an array of items.
 *
 * @param mixed item
 * @param array items
 *
 * @return array
 */
function removeItem( item, items ) {
	if ( Array.isArray( items ) && items.length > 0 ) {
		for ( let i = 0; i < items.length; i++ ) {
			if ( items[i] == item ) {
				items.splice( i, 1 );
			}
		}
	}
}

/**
 * Shop React Component.
 */
export default function Shop() {

	const [shopUrl, setShopUrl] = useState( 'https://demo.itthinx.com/wps' );

	const [query, setQuery] = useState( '' );

	const [terms, setTerms] = useState( [] );

	const [colors, setColors] = useState( [] );

	const [sizes, setSizes] = useState( [] );

	const [prices, setPrices] = useState( { min : '', max : '' } );

	const [data, setData] = useState( null );

	const [page, setPage] = useState( 1 );

	const suffix = 'wp-json/wps/v1/shop';

	useEffect(
		() => {

			//
			// Setup code
			//
			// @see https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
			//
			let _url = new URL( trailingSlash( shopUrl ) + suffix );
			let searchParams = new URLSearchParams( _url.search );
			if ( query ) {
				searchParams.append( 'q', query );
			}
			let termsParam = [];
			if ( terms.length > 0 ) {
				termsParam.push( { 'taxonomy' : 'product_cat', 't' : terms, 'id_by' : 'id' } );
			}
			if ( colors.length > 0 ) {
				termsParam.push( { 'taxonomy' : 'pa_color', 't' : colors, 'id_by' : 'id' } );
			}
			if ( sizes.length > 0 ) {
				termsParam.push( { 'taxonomy' : 'pa_size', 't' : sizes, 'id_by' : 'id' } );
			}
			if ( prices.min !== '' ) {
				searchParams.append( 'min_price', prices.min );
			}
			if ( prices.max !== '' ) {
				searchParams.append( 'max_price', prices.max );
			}
			if ( page > 1 ) {
				searchParams.append( 'page', page );
			}
			if ( termsParam.length > 0 ) {
				// set term constraints
				searchParams.append( 't', JSON.stringify( termsParam ) );
				// don't limit colors or sizes to those selected using the 'except' parameter for those taxonomies, so we can have multiple choices there
				searchParams.append(
					'taxonomy-data',
					JSON.stringify(
						[
							{ 'taxonomy' : 'product_cat' },
							{ 'taxonomy' : 'product_tag' },
							{ 'taxonomy' : 'pa_color', 'except' : 'pa_color' },
							{ 'taxonomy' : 'pa_size', 'except' : 'pa_size' }
						]
					)
				);
			}

			let urlParams = searchParams.toString();
			const filterUrl = new URL(`${_url.origin}${_url.pathname}?${urlParams}`);
			const fetchUrl = filterUrl.href;
			const controller = new AbortController();
			const promise = fetch(
				fetchUrl,
				{
					// https://developer.mozilla.org/en-US/docs/Web/API/fetch#signal
					signal : controller.signal
				}
			).then(
				(response) => {
					if ( response.ok ) {
						console.log( 'Shop response received' );
					} else {
						console.log( 'Shop response FAILED' );
					}
					return response.json();
				}
			).then(
				( value ) => {
					console.log( 'Fetched shop response: ', value );
					setData( value );
				}
			).catch(
				( ex ) => {
					console.log( 'Exception during fetch ' + fetchUrl + ' : ', ex );
				}
			);

			//
			// Cleanup code
			//
			return (
				() => {
					controller.abort();
				}
			);
		},
		[shopUrl, query, terms, colors, sizes, prices, page]
	);

	/**
	 * Handle change to the input field and set the query state to reflect the input.
	 *
	 * @param string input
	 */
	function handleUpdate( input ) {
		setQuery( input );
	}

	/**
	 * Toggle term selection.
	 *
	 * @param int term_id
	 */
	function handleTermClick( term_id ) {
		term_id = parseInt( term_id );
		const newTerms = [...terms];
		// toggle term
		if ( newTerms.includes( term_id ) ) {
			removeItem( term_id, newTerms );
		} else {
			// remove all ancestors of term_id
			let ancestors = term_id in categories_map ? categories_map[term_id] : [];
			for ( let i = 0; i < ancestors.length; i++ ) {
				if ( newTerms.includes( ancestors[i] ) ) {
					removeItem( ancestors[i], newTerms );
				}
			}
			// remove all children of term_id
			for ( let x in categories_map ) {
				// is term_id a parent
				if ( categories_map[x].includes( term_id ) ) {
					removeItem( x, newTerms );
				}
			}
			// add the term_id
			newTerms.push( term_id );
		}
		setTerms( newTerms );
	}

	/**
	 * Toggle color selection.
	 */
	function handleColorClick( term_id ) {
		term_id = parseInt( term_id );
		const newTerms = [...colors];
		// toggle color
		if ( newTerms.includes( term_id ) ) {
			removeItem( term_id, newTerms );
		} else {
			newTerms.push( term_id );
		}
		setColors( newTerms );
	}

	/**
	 * Toggle size selection.
	 */
	function handleSizeClick( term_id ) {
		term_id = parseInt( term_id );
		const newTerms = [...sizes];
		// toggle color
		if ( newTerms.includes( term_id ) ) {
			removeItem( term_id, newTerms );
		} else {
			newTerms.push( term_id );
		}
		setSizes( newTerms );
	}

	/**
	 * Determine price range.
	 */
	function handlePrices( values ) {
		const newPrices = {...prices};
		if ( typeof values.min !== 'undefined' ) {
			let min = parseFloat( values.min );
			if ( !isNaN( min ) ) {
				newPrices.min = min;
			} else {
				newPrices.min = '';
			}
		}
		if ( typeof values.max !== 'undefined' ) {
			let max = parseFloat( values.max );
			if ( !isNaN( max ) ) {
				newPrices.max = max;
			} else {
				newPrices.max = '';
			}
		}
		if ( newPrices.max !== '' && newPrices.min > newPrices.max ) {
			newPrices.max = '';
		}
		if ( newPrices.min !== prices.min || newPrices.max !== prices.max ) {
			setPrices( newPrices );
		}
	}

	/**
	 * Clear filters.
	 */
	function handleReset() {
		setQuery( '' );
		let queryResetEvent = new CustomEvent( 'reset', { detail : 'product-search-field' } );
		document.dispatchEvent( queryResetEvent );
		setTerms( [] );
		setColors( [] );
		setSizes( [] );
		setPrices( { min: '', max: '' } );
		let minResetEvent = new CustomEvent( 'reset', { detail : 'min-price' } );
		document.dispatchEvent( minResetEvent );
		let maxResetEvent = new CustomEvent( 'reset', { detail : 'max-price' } );
		document.dispatchEvent( maxResetEvent );
		setPage( 1 );
	}

	/**
	 * Set the shop URL.
	 */
	function handleShopUrlUpdate( url ) {
		setShopUrl( url );
	}

	/**
	 * Map children to all their ancestors.
	 *
	 * @param array terms
	 *
	 * @return array
	 */
	function get_parent_map( terms ) {
		let map = [];
		for ( let i = 0; i < terms.length; i++ ) {
			let term = terms[i];
			if ( !term.parent ) {
				map[term.id] = [];
			} else {
				map[term.id] = [term.parent];
			}
		}
		let scan = true;
		while ( scan ) {
			scan = false;
			for ( let id in map ) {
				let parents = map[id];
				if ( parents.length > 0 ) {
					for ( let k in parents ) {
						let parent = parents[k];
						if ( parent in map ) { // key exists in map
							for ( let x in map[parent] ) {
								if ( !parents.includes( map[parent][x] ) ) {
									parents.push( map[parent][x] );
									map[id] = parents;
									scan = true;
								}
							}
						}
					}
				}
			}
		}
		return map;
	}

	const products = data !== null && typeof data.products !== 'undefined' && typeof data.products.products !== 'undefined' ? data.products.products : [];

	let categories = [];
	if ( data !== null && typeof data.terms !== 'undefined' && data.terms.length > 0 ) {
		for ( let i = 0; i < data.terms.length; i++ ) {
			let terms = data.terms[i];
			if ( typeof terms.taxonomy !== 'undefined' && terms.taxonomy === 'product_cat' ) {
				if ( typeof terms.terms !== 'undefined' ) {
					categories = terms.terms;
				}
			}
		}
	}

	// we use this map to impose navigation constraints on categories when "moving"" within the hierarchy
	let categories_map = get_parent_map( categories );

	let color_terms = [];
	if ( data !== null && typeof data.terms !== 'undefined' && data.terms.length > 0 ) {
		for ( let i = 0; i < data.terms.length; i++ ) {
			let terms = data.terms[i];
			if ( typeof terms.taxonomy !== 'undefined' && terms.taxonomy === 'pa_color' ) {
				if ( typeof terms.terms !== 'undefined' ) {
					color_terms = terms.terms;
				}
			}
		}
	}

	let size_terms = [];
	if ( data !== null && typeof data.terms !== 'undefined' && data.terms.length > 0 ) {
		for ( let i = 0; i < data.terms.length; i++ ) {
			let terms = data.terms[i];
			if ( typeof terms.taxonomy !== 'undefined' && terms.taxonomy === 'pa_size' ) {
				if ( typeof terms.terms !== 'undefined' ) {
					size_terms = terms.terms;
				}
			}
		}
	}

	const total = data !== null && typeof data.products !== 'undefined' && typeof data.products.total !== 'undefined' ? data.products.total : 0;

	const count = data !== null && typeof data.products !== 'undefined' && typeof data.products.products !== 'undefined' ? data.products.products.length : 0;

	let counts = <>No results</>;
	if ( count > 0 ) {
		counts = <>Showing {(page-1)*per_page+1} &ndash; {(page-1)*per_page + count} of {total}</>;
	}

	return (
		<>
			<TextInputDelayed id="product-search-field" delay="500" handleUpdate={handleUpdate} placeholder="Search products &hellip;" />
			<div className="showcase">
				<div className="filters">
					<Categories items={categories} handleTermClick={handleTermClick} terms={terms} />
					<Colors items={color_terms} handleTermClick={handleColorClick} terms={colors} />
					<Sizes items={size_terms} handleTermClick={handleSizeClick} terms={sizes} />
					<Prices minPrice={prices.min} maxPrice={prices.max} handlePrices={handlePrices} />
					<Reset resetHandler={handleReset} />
				</div>
				<Products items={products} />
			</div>
			<div className="counts">
				{counts}
			</div>
			<div className="pagination">
				<Pagination page={page} total={total} setPage={setPage} />
			</div>
			<div class="separator fine"></div>
			<p className="endpoint-info">
				This example uses the endpoint of the demo site for the <a href="https://woocommerce.com/product/woocommerce-product-search">WooCommerce Product Search</a> extension by default.
				You can input the URL of your own site below.
			</p>
			<TextInputDelayed cssClass="endpoint-input" delay="1000" handleUpdate={handleShopUrlUpdate} placeholder="Shop URL" value={shopUrl}/>
			<p>
				REST API Endpoint: <a className="endpoint-url" href={ trailingSlash( shopUrl ) + suffix }>{ trailingSlash( shopUrl ) + suffix }</a>
			</p>
		</>
	);
}
