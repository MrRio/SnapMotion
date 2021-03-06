/*
 * SnapMotion
 * By Snapshot Media (http://snapshotmedia.co.uk/)
 * Copyright (c) 2010 Snapshot Media
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
*/

(function($){
	$.fn.SnapMotion = function(options) {
		var el = this;
		
		jQuery(el).addClass('snapmotion');
		
		var settings = {
			'slideWidth': 960,	// Width of the slideshow
			'controlIndent': 640,	// Indentation of control area (px)
			'animationLength': 375,	// Length of fade (ms)
			'delay': 7500	// Delay between slides (ms)
		};
		
		if (options) { 
			$.extend(settings, options);
		}

		var isAnimating = false;							// Flag to check whether elements are animating
		var limit = el.children("li").size() - 1;			// Zero-indexed slide count
		var ssWidth = settings['slideWidth'] * (limit+1);	// Width of whole slideshow					
		var fadeStep = settings['animationLength'] + 50;			// Transition timeout length

		// Insert controls into DOM
		var controlsString = '<div class="snapmotion-controls"><ul>';
		for (var i = 1; i <= el.children("li").size(); i++) {
			controlsString += '<li><div class="snapmotion-content"></div><ul class="controls"><li class="prev"><a href="#">&lt; Previous</a></li><li class="next"><a href="#">Next &gt;</a></li></ul></li>';
		}
		controlsString += '</ul><img src="img/feature_shades.png" alt="Feature shades" width="960" height="399" class="featureShades" /></div>';
		
		jQuery(controlsString).insertAfter(el);
		
		// Pull control content from <span> into controls
		for (var i = 0; i <= limit; i++) {
			var span = el.children("li").eq(i).find("span");
			var controlHtml = span.html();
			span.remove();
			el.siblings(".snapmotion-controls").children("ul").children("li").eq(i).children("div.snapmotion-content").html(controlHtml);
		}
		
		var newLeftIndex = limit;
		var newRightIndex = limit - 1;
		var furthestSlideLeft = el.children("li").eq(newLeftIndex);
		var furthestSlideRight = el.children("li").eq(newRightIndex);
		var furthestControlsLeft = el.siblings(".snapmotion-controls").children("ul").children("li").eq(newLeftIndex);
		var furthestControlsRight = el.siblings(".snapmotion-controls").children("ul").children("li").eq(newRightIndex);
		var interval = 0;

		// Hide slideshow items, position them
		el.children("li").hide().each(function(){
			var xPos = el.children("li").index(jQuery(this)) * settings['slideWidth'];
			jQuery(this).css({'left' : xPos + 'px'});
		});
		// Hide slideshow controls, position them
		el.siblings(".snapmotion-controls").children("ul").children("li").hide().each(function(){
			var xPos = (el.siblings(".snapmotion-controls").children("ul").children("li").index(jQuery(this)) * settings['slideWidth']) + settings['controlIndent'];
			jQuery(this).css({'left' : xPos + 'px'});
		});

		// Move last slide behind first for smooth transitioning
		el.children("li").eq(limit).animate({'left' : '-=' + ssWidth}, 1);
		el.siblings(".snapmotion-controls").children("ul").children("li").eq(limit).animate({'left' : '-=' + ssWidth}, 1);

		// Fade slides & controls in
		el.children("li").fadeIn(settings['animationLength']);
		el.siblings(".snapmotion-controls").children("ul").children("li").fadeIn(settings['animationLength']);
		
		// Hey, ho, let's go!
		startSlideshow();
		
		// Slideshow control navigation event handling
		el.siblings(".snapmotion-controls").find(".controls li a").click(function(){
			var topLi = jQuery(this).parents("ul.controls").parent();
			var parentLi = jQuery(this).parent();
			var index = el.siblings(".snapmotion-controls").children("ul").children("li").index(jQuery(this).parents("ul.controls").parent());
			if (!isAnimating) {
				isAnimating = true;

				if (jQuery(this).parent().hasClass('next')) { // Next button clicked
					pushNext();
				} else { // Prev button clicked
					pushPrev();
				}
				resetSlideshow();
			}

			return false;
		});

		function pushNext() {
			el.children("li").animate({
				left: '-=' + settings['slideWidth']
			}, settings['animationLength']);
			setTimeout(function(){
				el.siblings(".snapmotion-controls").children("ul").children("li").animate({
					left: '-=' + settings['slideWidth']
				}, settings['animationLength']);
				setTimeout(function(){
					rejig(true);			// Throw boundary slide & controls to end of queue
					isAnimating = false;	// Re-enable clicking
				}, fadeStep);
			}, settings['animationLength']);
		}

		function pushPrev() {
			el.children("li").animate({
				left: '+=' + settings['slideWidth']
			}, settings['animationLength']);
			setTimeout(function(){
				el.siblings(".snapmotion-controls").children("ul").children("li").animate({
					left: '+=' + settings['slideWidth']
				}, settings['animationLength']);
				setTimeout(function(){
					rejig(false);			// Throw boundary slide & controls to end of queue
					isAnimating = false;	// Re-enable clicking
				}, fadeStep);
			}, settings['animationLength']);
		}

		// Rejig the slides so the current slide is always in the middle of the queue
		function rejig(isNext) {
			if (isNext) {
				furthestSlideLeft.animate({'left' : '+=' + ssWidth}, 1);
				furthestControlsLeft.animate({'left' : '+=' + ssWidth}, 1);
				newLeftIndex = ((el.children("li").index(furthestSlideLeft) < limit) ? el.children("li").index(furthestSlideLeft) + 1 : 0);
				newRightIndex = ((el.children("li").index(furthestSlideRight) < limit) ? el.children("li").index(furthestSlideRight) + 1 : 0);
			} else {
				furthestSlideRight.animate({'left' : '-=' + ssWidth}, 1);
				furthestControlsRight.animate({'left' : '-=' + ssWidth}, 1);
				newLeftIndex = ((el.children("li").index(furthestSlideLeft) > 0) ? el.children("li").index(furthestSlideLeft) - 1 : limit);
				newRightIndex = ((el.children("li").index(furthestSlideRight) > 0) ? el.children("li").index(furthestSlideRight) - 1 : limit);
			}
			furthestSlideLeft = el.children("li").eq(newLeftIndex);
			furthestControlsLeft = el.siblings(".snapmotion-controls").children("ul").children("li").eq(newLeftIndex);
			furthestSlideRight = el.children("li").eq(newRightIndex);
			furthestControlsRight = el.siblings(".snapmotion-controls").children("ul").children("li").eq(newRightIndex);
		}
		
		function startSlideshow() {
			interval = setInterval(function(){
				pushNext();
			}, settings['delay']);
		}

		function resetSlideshow() {
			clearInterval(interval);
			startSlideshow();
		}
	};
})(jQuery);