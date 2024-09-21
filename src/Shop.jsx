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
		</div>
	);
}

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

function Category ( { item, handleTermClick, terms } ) {

	function onClick( event ) {
		handleTermClick( item.id );
	}

	let cssClass = "category";

	if ( terms.includes( item.id ) ) {
		cssClass += ' active';
	}

	return (
		<div className={cssClass} onClick={onClick}>
			{item.name}
		</div>
	);
}

/**
 * A text input field functional React component that allows to schedule a delayed call to an update handler,
 * so we don't have to react on every single keystroke right when it happens.
 *
 * @param int delay how many milliseconds to wait after the text input has changed before calling the update handler
 * @param function the update handler
 */
function TextInputDelayed( { delay, handleUpdate, placeholder, value, cssClass } ) {

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
		setText( input ); // @todo trim

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

	// Render a text input field and register the change event handler
	return (
		<input className={className} type="text" value={text} onChange={handleChange} placeholder={placeholder} />
	);
}

function trailingSlash( s ) {
	if ( s.substr( -1 ) !== '/' ) {
		s = s + '/';
	}
	return s;
}

export default function Shop() {

	const [shopUrl, setShopUrl] = useState( 'https://demo.itthinx.com/wps' );

	const [query, setQuery] = useState( '' );

	const [terms, setTerms] = useState( [] );

	const [data, setData] = useState( null );

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
			if ( terms ) {
				let termsParam = [ { 'taxonomy' : 'product_cat', 't' : terms, 'id_by' : 'id' } ];
				searchParams.append( 't', JSON.stringify( termsParam ) );
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
		[shopUrl, query, terms]
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
		const newTerms = [...terms];
		// toggle term
		if ( newTerms.includes( term_id ) ) {
			for ( let i = 0; i < newTerms.length; i++ ) {
				if ( newTerms[i] === term_id ) {
					newTerms.splice( i, 1 );
				}
			}
		} else {
			newTerms.push( term_id );
		}
		setTerms(newTerms);
	}

	function handleShopUrlUpdate( url ) {
		console.log( url );
		setShopUrl( url );
	}

	const products = data !== null && typeof data.products !== 'undefined' && typeof data.products.products !== 'undefined' ? data.products.products : [];

	let categories = [];
	if ( data !== null && typeof data.terms !== 'undefined' && data.terms.length > 0 ) {
		for ( let i = 0; i < data.terms.length; i++ ) {
			let terms = data.terms[0];
			if ( typeof terms.taxonomy !== 'undefined' && terms.taxonomy === 'product_cat' ) {
				if ( typeof terms.terms !== 'undefined' ) {
					categories = terms.terms;
				}
			}
		}
	}

	const total = data !== null && typeof data.products !== 'undefined' && typeof data.products.total !== 'undefined' ? data.products.total : 0;

	const count = data !== null && typeof data.products !== 'undefined' && typeof data.products.products !== 'undefined' ? data.products.products.length : 0;

	return (
		<>
			<TextInputDelayed delay="500" handleUpdate={handleUpdate} placeholder="Search products &hellip;" />
			<Categories items={categories} handleTermClick={handleTermClick} terms={terms} />
			<Products items={products} />
			<p className="counts">
				Showing {count} of {total}
			</p>
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
