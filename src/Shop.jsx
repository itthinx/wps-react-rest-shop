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

/**
 * A text input field functional React component that allows to schedule a delayed call to an update handler,
 * so we don't have to react on every single keystroke right when it happens.
 *
 * @param int delay how many milliseconds to wait after the text input has changed before calling the update handler
 * @param function the update handler
 */
function TextInputDelayed( { delay, handleUpdate } ) {

	/**
	 * @param object whose current property holds the timeoutID of the currently scheduled timeout
	 */
	const timeout = useRef( null );

	/**
	 * @param array the current state and a set function to update the state based on the text input field
	 */
	const [text, setText] = useState( '' );

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

	// Render a text input field and register the change event handler
	return (
		<input className="product-search-field" type="text" value={text} onChange={handleChange} placeholder="Search products &hellip;"/>
	);
}

export default function Shop() {

	const [query, setQuery] = useState( '' );

	const [data, setData] = useState( null );

	const url = 'http://qi/~kento/wps/wp-json/wps/v1/shop';

	useEffect(
		() => {

			//
			// Setup code
			//
			// @see https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
			//
			const controller = new AbortController();
			const fetchUrl = query ? url + '?q=' + query : url;
			const promise = fetch(
				fetchUrl,
				{
					// https://developer.mozilla.org/en-US/docs/Web/API/fetch#signal
					signal : controller.signal
				}
			).then(
				(response) => {
					if ( response.ok ) {
						console.log( 'shop response received' );
					} else {
						console.log( 'shop response FAILED' );
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
		[query]
	);

	/**
	 * Handle change to the input field and set the query state to reflect the input.
	 *
	 * @param string input
	 */
	function handleUpdate( input ) {
		setQuery( input );
	}

	const products = data !== null && data.products !== 'undefined' && data.products.products !== 'undefined' ? data.products.products : [];

	const total = data !== null && data.products !== 'undefined' && data.products.total !== 'undefined' ? data.products.total : 0;

	const count = data !== null && data.products !== 'undefined' && data.products.products !== 'undefined' ? data.products.products.length : 0;

	return (
		<>
			<TextInputDelayed delay="500" handleUpdate={handleUpdate} />
			<Products items={products}/>
			<p className="counts">
				Showing {count} of {total}
			</p>
		</>
	);
}
