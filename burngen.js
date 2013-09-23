/*
 * main script for burn.fm
 * http://burn.fm
 *
 * Copyright (c) 2012-2013 Abhinav Nellore
 * Licensed under the MIT License. See LICENSE.
 */

              YOUTUBES = 7;
              addwhere = -1;
              
              (function($){
 
    $.fn.shuffle = function() {
    if (!shufflestart) {
       shufflestart = true;
 
        var allElems = this.get(),
            getRandom = function(max) {
                return Math.floor(Math.random() * max);
            },
            shuffled = $.map(allElems, function(){
                var random = getRandom(allElems.length),
                    randEl = $(allElems[random]).clone(true)[0];
                allElems.splice(random, 1);
                return randEl;
           });
 
        this.each(function(i){
            $(shuffled[i]).hide();
            $(this).fadeOut(200, function() {$(this).replaceWith($(shuffled[i])); $(shuffled[i]).fadeIn(200, function() {shufflestart = false;});});
        });
        if (songs.getNumber() > 1) songs.burnUrl(); 
        return $(shuffled);
        }
 
    };
 
})(jQuery);

              function execute_function(fn, context, params) {
                               return function() {
                                 fn.apply(context, params);
                                };
                            }
              function tube_top (title, artist) {
                var artiststripped = artist.split(/\band\b|\bthe\b|\ba\b|\(|\)|\-/i).join('');
                artiststripped = artiststripped.split(/\b\s+\b/);
                var titlestripped = title.split(/\band\b|\bthe\b|\ba\b|\(|\)|\-|\bdemo\b/i).join('');
                return (artiststripped[0] + ' ' + (typeof artiststripped[1] == 'undefined' ? '' : artiststripped[1] + ' ' ) + (typeof artiststripped[2] == 'undefined' ? '' : artiststripped[2] + ' ' ) + titlestripped.split(/\bfeat\./i)[0] );
              }
              
              function align(v1, v2) {
              	//Needleman-Wunsch: output a set of instructions for inserting/replacing itunes ids. STILL IN DEV.
              	var a = [];
              	for (var i = 0; i < v1.length+1; i++) {
              		a[i] = [];
              		a[i][0] = 0;
              	}
              	for (var j = 0; j < v2.length+1; j++) {
              		a[0][j] = 0;
              	}
              	for (var i = 1; i < v1.length+1; i++) {
              		for (var j = 1; j < v2.length+1; j++) {
              			a[i][j] = Math.max(a[i-1][j-1] + (v1[i]==v2[j]), a[i][j-1], a[i-1][j]);
              		}
              	}
              	i=v1.length;
              	j=v2.length;
              	var n = [];
              	var themax;
              	console.log(a);
              	while (i > 0 && j > 0) {
              		// -1: delete, -2: match, id: insert
              		themax = Math.max(a[i-1][j-1], a[i][j-1], a[i-1][j]);
              		if (a[i-1][j-1] == themax) {
              			if (v2[j-1] == v1[i-1]) {
              				n.unshift(-2);
              			} else {
              				n.unshift(-1, v2[j-1]);
              			}
              			i--;
              			j--;
              		} else if (a[i-1][j] == themax) {
              			n.unshift(-1);
              			i--;
              		} else {
              			n.unshift(v2[j-1]);
              			j--;
              		}
              	}
              	if (i > 0) {
              		while (i > 0) {
              			n.unshift(-1);
              			i--;
              		}
              	}
              	if (j > 0) {
              		while (j > 0) {
              			n.unshift(v2[j-1]);
              			j--;
              		}
              	}
              	return n;
              }
              
              function Songs() {
				var that = this;
				var songs = [];
				var refreshq = false;
				var next_free_index = 0;
				var newindex = -1;
				that.getNumber = function() {
				  if ($('#list').length) { return $('#list').children().length-1;}
				  else return 0;
					/*var notSongCounter = 0;
					for(var i = 0; i < songs.length; i++) {
						if( typeof songs[i] == 'undefined') {
							notSongCounter++;
						}
					}
					return (songs.length - notSongCounter);*/
				}
				
				that.getNewYouTube = function() {
				  if (songs[globalindex][6].length-2 != songs[globalindex][6][songs[globalindex][6].length-1]) {
				    songs[globalindex][6][songs[globalindex][6].length-1]++;
				  }
				  else {
				    songs[globalindex][6][songs[globalindex][6].length-1] = 0;
				  }
				  player.loadVideoById(songs[globalindex][6][songs[globalindex][6][songs[globalindex][6].length-1]].match(/=(.+?)\&/, '$1')[1]);
				}
				
				function selectNext() {
				  var orderedIndices = that.getOrderedIndices();
				        var nowactualindex = $.inArray(last_index, orderedIndices);
				        if(nowactualindex != orderedIndices.length-1) {
				          that.select(orderedIndices[nowactualindex+1], 0);
				        }
				        else if (loop == 2) {
				          that.select(orderedIndices[0], 0);
				        }
				}
				
				function onEnd(newState) {
if (!flickq && typeof player != 'undefined' && typeof player.pauseVideo != 'undefined') player.pauseVideo();
if(newState.data==0) {
				        if (loop == 1 || (loop == 2 && that.getNumber() == 1)) {
				          	player.playVideo();				        
				        } else {
selectNext();
				        }
				      }
				      else if (refreshq) {
refreshq=false;
player.cueVideoById(songs[newindex][6][songs[newindex][6][songs[newindex][6].length-1]].match(/=(.+?)\&/, '$1')[1]);
				    player.setPlaybackQuality('medium');
				    player.playVideo();	        
				      }
				    }
				
				function onPlayerReady(event) {
				      event.target.setPlaybackQuality('medium');
                      event.target.playVideo();
                    }
                
                function toggleflick() {
                    if(flickq) {
                      $('#tubecontainer').animate({'right': '-16em'}, 200);   
                    }
                    else {
                      $('#tubecontainer').animate({'right': '0em'}, 200);   
                    }
                    flickq = !flickq;
                }
				
				function watch(index) {
				globalindex=index;
					if (!flickq) {
toggleflick();
}
                  if(!$('iframe#tube').length) {
                    onYouTubePlayerAPIReady = function() {
                      player = new YT.Player('tube', {
                      height: '100%',
                      width: '100%',
                      videoId: songs[index][6][songs[index][6][songs[index][6].length-1]].match(/=(.+?)\&/, '$1')[1],
                      events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onEnd,
                        'onError': that.getNewYouTube
                      }
                      });
                    }
                    $.getScript('http://www.youtube.com/player_api');
				  }
				  else {
				  if (typeof player != 'undefined' && typeof player.getVideoUrl != 'undefined') {if(player.getVideoUrl().match(/(\?|\&)v=(.+?)(\&|\b)/, '$1')[2] != songs[index][6][songs[index][6][songs[index][6].length-1]].match(/=(.+?)\&/, '$1')[1]) {
				    player.cueVideoById(songs[index][6][songs[index][6][songs[index][6].length-1]].match(/=(.+?)\&/, '$1')[1]);
				    player.setPlaybackQuality('medium');
				    player.playVideo();
				    refreshq = true;
				    newindex = index;
				  }
				  else {
if (typeof player != 'undefined' && typeof player.playVideo != 'undefined') player.playVideo();				  }}
				}
				}
				
				that.select = function(index, thetime) {
					if(typeof t != 'undefined') clearTimeout(t);
					if($('#song_' + index).length) { if (index != last_index) {
						if (last_index == -1) {watch(index);} else {t=setTimeout(function() {watch(index);}, thetime);}
						if($('#song_' + last_index).length) {
                             $('#song_' + last_index + ' .item').removeClass('select', 100);
						}
						$('#song_' + index + ' .item').addClass('select', 100);
						$('#addhere').insertAfter('#song_' + index);
						last_index = index;
				  }
				  else {
				     if (flickq) {
toggleflick();				     
}
				       if (typeof player != 'undefined' && typeof player.pauseVideo != 'undefined') player.pauseVideo();
				       $('#song_' + last_index + ' .item').removeClass('select', 100);
				       last_index = -1;
				  }
				  }
				}

				function getiTunesIds() {
				  return ($.map(songs, function(song) {
						if (typeof song != 'undefined') {return song[7];} else {return -1;}
					}));
				}
				

			  that.burnUrl = function() {
					if (burnq) {
					var url = '69.181.193.154/~anellore/' + encodeURIComponent('#' + that.getOrderedIds().join(',') + '&' + thehash.slice(1));
					$.ajax({
						url : "http://d.burn.fm/yourls-api.php?signature=90e32f5ca0&action=shorturl&format=jsonp&url=" + url,
						dataType : "jsonp",
						success : function(data) {
						    if(typeof data.shorturl != 'undefined' && thehash != '#' + data.shorturl.slice(17)) {
						      theprev = thehash.slice(1);
						      thehash = '#' + data.shorturl.slice(17);
						      reloadq = false;
						      window.location.hash = thehash;
						      $('#hash').fadeOut(100, function() {
						      		$('#hash').html(thehash);
						      		$('#hash').fadeIn(100);
						      });
}
else {

}

						}
					});
				}

				}
				
			

				that.getOrderedIds = function() {
					var orderedIds = [];
					$('#list').children().each(function() {
						if ($(this).attr('id') != 'addhere') orderedIds.push($(this).attr('id'));
					});
					return ($.map(orderedIds, function(song_label) {
						return songs[parseInt(song_label.slice(5))][7];
					}));
				}
				
				that.getOrderedIndices = function() {
					var orderedIndices = [];
					$('#list').children().each(function() {
						if ($(this).attr('id') != 'addhere') orderedIndices.push(parseInt($(this).attr('id').slice(5)));
					});
					return orderedIndices;
				}

				that.isAdded = function(itunes_id) {
					if($.inArray(itunes_id, getiTunesIds()) != -1)
						return true;
					return false;
				}
				
				that.remove = function(index) { console.log("hi1");
					if($('#song_' + index).length) {
						console.log('removing ');
						console.log($('#song_' + index));
						$('#song_' + index).slideUp(200, function() {if (index == last_index) {/*$('#tubecontainer').dialog({close: function() {player.pauseVideo();
				     last_index = -1; $('#song_' + index).remove(); delete songs[index];
						that.burnUrl();}}); $('#tubecontainer').dialog('close');*/ player.pauseVideo();
				     selectNext(); $('#song_' + index).remove(); delete songs[index];
						that.burnUrl(); if (flickq) {
toggleflick();				     }} else {$('#song_' + index).remove(); delete songs[index];
						that.burnUrl();}});
					}
				}
				

				that.add = function(name, album, artist, album_art_url, itunes_url, preview_url, youtube_url, itunes_id, collection_id, artist_id, add_dupes_q) {
					if (!add_dupes_q && that.isAdded(itunes_id) || !$('#addhere').length) {
						console.log("isAdded");
						return false;
					} 
					if (!that.getNumber()) $('#psa').fadeOut(200);
					songs[next_free_index] = [name, album, artist, album_art_url, itunes_url, preview_url, youtube_url, itunes_id, collection_id, artist_id];
					if (addwhere < 1) {
						$('#addhere').before('<li class="songitem" id="song_' + next_free_index + '"></li>');
					} else {
						console.log('here');
						console.log(addwhere);
						console.log($('#list .songitem:eq(' + addwhere +')'));
						console.log($('#list .songitem:eq(' + (addwhere-1) +')'))
						$('#list .songitem:eq(' + (addwhere) +')').after('<li class="songitem" id="song_' + next_free_index + '"></li>');
					}
					$('#song_'+ next_free_index).hide();
					$('#song_' + next_free_index).prepend('<div class="item"><span class="delete" id="remove_' + next_free_index + '">X</span><span class="sort">o</span><span class="title sel">' + name + ' </span><span class="nobr"><span class="artist sel">' + artist + ' </span><span class="addartist" id="addartist_' + next_free_index + '">+</span><span class="album sel">' + album + ' </span><span class="addalbum" id="addalbum_' + next_free_index + '">+</span></span><a class="itunes" href="' + itunes_url + '" target="_window">iTunes</a></div>');
					$('#remove_' + next_free_index).click((function (next_free_index){return function (event) { event.stopPropagation(); that.remove(next_free_index); 
};})(next_free_index));
$('#addalbum_' + next_free_index).click((function (next_free_index){return function (event) { event.stopPropagation(); that.addAlbum(next_free_index); 
};})(next_free_index));
$('#addartist_' + next_free_index).click((function (next_free_index){return function (event) { event.stopPropagation(); that.addArtist(next_free_index, 10, true, true); 
};})(next_free_index));
					$('#song_' + next_free_index + ' .sel').click((function(index) {
						return function() {
							that.select(index, 900);
						};
					})(next_free_index));
					$('#song_' + next_free_index).slideDown(100, function() {  /*$("html,body").animate({ scrollTop: $('#addhere').position().top+$('#addhere').height()*2 - $(window).height() }, 100);*/
});
					console.log('added');
					console.log($('#song_' + next_free_index));
					next_free_index++;
					that.burnUrl();
					return true;
				}
				
				that.updateSongs = function (backq) {
					$('body').prepend('<iframe id="hidehash" name="hidehash" style="display:none;" />');
                    $('#hidehash').load(function() {
                       var hidehashinfo = $('#hidehash').contents().find('#hidehashinfo').html();
                       if (hidehashinfo != null) var componentsnext = hidehashinfo.split('&');
                       if (typeof componentsnext != 'undefined' && componentsnext[0] != '#') {
                       //if components exist and are valid, ...
                       theprev = componentsnext[1].slice(4);
                        reloadq = false;
						window.location.hash = '#loading';
						$('#hash').fadeOut(100, function() {
						      $('#hash').html('#loading');
						      		$('#hash').fadeIn(100);
						      });
                         $('#hidehash').remove();
                         instruct = align(that.getOrderedIds(), $.map(componentsnext[0].slice(1).split(','), function(val) {return parseInt(val);}));
                         console.log(instruct);
                         lookups = $.grep(instruct, function(val) {return (val >= 0);});
                         console.log(lookups.join(','));
                         if (lookups.length) {
                         $.ajax({
						url : "http://itunes.apple.com/lookup?id=" + lookups.join(','),
						dataType : "jsonp",
						success : function(data) {
						    var function_queue = [];
						    for (var i=0; i<data.results.length; i++) {
						      $.ajax({
							url : "http://gdata.youtube.com/feeds/api/videos?alt=json-in-script&format=5&max-results=" + YOUTUBES,
							data: {
							  q: tube_top(data.results[i].trackName, data.results[i].artistName)
							},
							dataType : "jsonp",
							success : (function(i) { return function(more_data) {
							console.log(data.results[i].trackName);
							console.log(execute_function(that.add, this, [data.results[i].trackName, data.results[i].collectionName, data.results[i].artistName, data.results[i].artworkUrl100.substring(0, data.results[i].artworkUrl100.length - 14) + '170x170-75.jpg',  data.results[i].trackViewUrl, data.results[i].previewUrl, typeof more_data.feed.entry != 'undefined' ? $.merge($.map(more_data.feed.entry, function(val) {return val.link[0].href;}),['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0]) : ['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0], data.results[i].trackId, typeof data.results[i].collectionId != 'undefined' ? data.results[i].collectionId : -1, typeof data.results[i].artistId != 'undefined' ? data.results[i].artistId : -1]));
								function_queue.push([i, execute_function(that.add, this, [data.results[i].trackName, data.results[i].collectionName, data.results[i].artistName, data.results[i].artworkUrl100.substring(0, data.results[i].artworkUrl100.length - 14) + '170x170-75.jpg',  data.results[i].trackViewUrl, data.results[i].previewUrl, typeof more_data.feed.entry != 'undefined' ? $.merge($.map(more_data.feed.entry, function(val) {return val.link[0].href;}),['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0]) : ['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0], data.results[i].trackId, typeof data.results[i].collectionId != 'undefined' ? data.results[i].collectionId : -1, typeof data.results[i].artistId != 'undefined' ? data.results[i].artistId : -1, true])]);
                                if (function_queue.length == data.results.length) {
                                  // Start populating burned page here
                                  //jQuery.fx.off = true;
                                  console.log(function_queue);
                                  function_queue = $.map(function_queue.sort(function(a, b) {return (b[0] - a[0]);}), function(a) {return a[1];});
                                  burnq=false;
                                  reloadq = true;
                                  addwhere = 0;
                                  for (var k=0; k<instruct.length; k++) {
                                  	if (instruct[k] == -1) {
                                  		console.log('removing child ' + addwhere);
                                  		that.remove(parseInt($('#list .songitem:eq(' + addwhere + ')').attr('id').slice(5)));
                                  	} else if (instruct[k] != -2) {
                                  		console.log('whatever');
                                  		(function_queue.pop())();
                                  	}
                                  	addwhere++;
                                  }
                                  addwhere = -1;
                                  //burnq=true;
                                  $('html,body').scrollTop(0);
                                  if (typeof forwards == 'undefined') {
                                  	forwards = [];
                                  }
                                  forwards.push(thehash);
                                  reloadq = false;
								  thehash = '#' + temphash;
								  $('#hash').fadeOut(100, function() {
						    	  $('#hash').html(thehash);
						     		 window.location.hash = thehash;
						      	  $('#hash').fadeIn(100);
						      });
                                  //jQuery.fx.off = false;
                                }
                               }; })(i)
                               });
						    }
						}
					});
					} else {
					burnq=false;
                                  reloadq = true;
						addwhere = 0;
						for (var k=0; k<instruct.length; k++) {
                                  	if (instruct[k] == -1) {
                                  		console.log($('#list .songitem'));
                                  		that.remove(parseInt($('#list .songitem:eq(' + addwhere +')').attr('id').slice(5)));
                                  		addwhere--;
                                  	} else if (instruct[k] != -2) {
                                  		console.log('whatever');
                                  		(function_queue.pop())();
                                  	}
                                  	addwhere++;
                                  }
                                  addwhere = -1;
                                  //burnq=true;
                                  $('html,body').scrollTop(0);
                                  if (typeof forwards == 'undefined') {
                                  	forwards = [];
                                  }
                                  forwards.push(thehash);
                                  reloadq = false;
								  thehash = '#' + temphash;
								  $('#hash').fadeOut(100, function() {
						    	  $('#hash').html(thehash);
						     		 window.location.hash = thehash;
						      	  $('#hash').fadeIn(100);
						      });
					}
				}
				else {
					//delete loading indicator
				}
				});
				if (backq) {
					temphash = theprev;
					console.log("hi");
					console.log(temphash);
					if (temphash == 'newmix') {
						window.location.hash = '#newmix';
                         window.location.reload();
                         //handle this properly later
					} else {
					$('#hidehash').attr('src', 'http://d.burn.fm/' + temphash);
					}
					console.log("ho");
				} else if (typeof forwards != 'undefined' && forwards.length) {
						temphash = forwards.pop();
						$('#hidehash').attr('src', 'http://d.burn.fm/' + temphash.slice(1));
					}
				}
				
				that.addAlbum = function(index) {
				   if (songs[index][8] != -1) {
				   var beforeadd = that.getNumber();
				   $.ajax({
						url : "http://itunes.apple.com/lookup?id=" + songs[index][8] + "&entity=song",
						dataType : "jsonp",
						success : function(data) {
						    var function_queue = [];
						    for (var i=1; i<data.results.length; i++) {
						      $.ajax({
							url : "http://gdata.youtube.com/feeds/api/videos?alt=json-in-script&format=5&max-results="+YOUTUBES,
							data: {
							  q: tube_top(data.results[i].trackName, data.results[i].artistName)
							},
							dataType : "jsonp",
							success : (function(i) { return function(more_data) {
								function_queue.push([i, execute_function(that.add, this, [data.results[i].trackName, data.results[i].collectionName, data.results[i].artistName, data.results[i].artworkUrl100.substring(0, data.results[i].artworkUrl100.length - 14) + '170x170-75.jpg', data.results[i].trackViewUrl, data.results[i].previewUrl, typeof more_data.feed.entry != 'undefined' ? $.merge($.map(more_data.feed.entry, function(val) {return val.link[0].href;}),['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0]) : ['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0], data.results[i].trackId, typeof data.results[i].collectionId != 'undefined' ? data.results[i].collectionId : -1, typeof data.results[i].artistId != 'undefined' ? data.results[i].artistId : -1,false])]);
                                if (function_queue.length == data.results.length-1) {
                                  // Start adding album here
                                  function_queue = $.map(function_queue.sort(function(a, b) {return (b[0] - a[0]);}), function(a) {return a[1];});
                                  burnq=false;
                                  while (function_queue.length > 0) {
                                    (function_queue.pop())();
                                  }
                                  burnq=true;
                                  if(that.getNumber() != beforeadd) that.burnUrl();
                                }
                               }; })(i)
                               });
						    }
						}
					});
					return true;
					}
                    return false;
				}
				
				that.addArtist = function(index, thismany, fromlistq, burnit) {
				   var theid;
				   if (fromlistq) {
				     theid = songs[index][9];
				   }
				   else {
				     theid = index;
				   }
				   if (theid != -1) {
				   var beforeadd = that.getNumber();
				   $.ajax({
						url : "http://itunes.apple.com/lookup?id=" + theid + "&entity=song",
						dataType : "jsonp",
						success : function(data) {
						    var function_queue = [];
						    var randos = [];
						    var datalength = data.results.length;
						    for (var i=0; i<thismany; i++) {
						      randos.push(Math.ceil(Math.random()*(datalength-1)));
						    }
						    for (var i=0; i<randos.length; i++) {
						      $.ajax({
							url : "http://gdata.youtube.com/feeds/api/videos?alt=json-in-script&format=5&max-results="+YOUTUBES,
							data: {
							  q: tube_top(data.results[randos[i]].trackName, data.results[randos[i]].artistName)
							},
							dataType : "jsonp",
							success : (function(i) { return function(more_data) {
								function_queue.push([i, execute_function(that.add, this, [data.results[randos[i]].trackName, data.results[randos[i]].collectionName, data.results[randos[i]].artistName, data.results[randos[i]].artworkUrl100.substring(0, data.results[randos[i]].artworkUrl100.length - 14) + '170x170-75.jpg', data.results[randos[i]].trackViewUrl, data.results[randos[i]].previewUrl, typeof more_data.feed.entry != 'undefined' ? $.merge($.map(more_data.feed.entry, function(val) {return val.link[0].href;}),['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0]) : ['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0], data.results[randos[i]].trackId, typeof data.results[randos[i]].collectionId != 'undefined' ? data.results[randos[i]].collectionId : -1, typeof data.results[randos[i]].artistId != 'undefined' ? data.results[randos[i]].artistId : -1,false])]);
								if (function_queue.length == randos.length) {
                                  function_queue = $.map(function_queue.sort(function(a, b) {return (b[0] - a[0]);}), function(a) {return a[1];});
                                  burnq=false;
                                  while (function_queue.length > 0) {
                                    (function_queue.pop())();
                                  }
                                  burnq=true;
                                  if(burnit && that.getNumber() != beforeadd) {
                                    that.burnUrl();
                                  }
                                }
                               }; })(i)
                               });
						    }
						}
					});
					return true;
					}
                    return false;
				}
				
				that.addGenre = function(index, thismany, burnit) {
				   if (index >= 0 && index < ids.length) {
				   var anartist;
				   var randos = [];
				   var function_queue = [];
				   var beforeadd = that.getNumber();
				   var arando, totaladded=0;
				   burnq=false;
				   for (var j=0; j<thismany; j++) {
				   anartist = ids[index][Math.floor(Math.random()*ids[index].length)][0];
				   $.ajax({
						url : "http://itunes.apple.com/lookup?id=" + anartist + "&entity=song&limit=50",
						dataType : "jsonp",
						success : function(data) {
						    arando = Math.ceil(Math.random()*(data.results.length-1));
						    $.ajax({
							url : "http://gdata.youtube.com/feeds/api/videos?alt=json-in-script&format=5&max-results="+YOUTUBES,
							data: {
							  q: tube_top(data.results[arando].trackName, data.results[arando].artistName)
							},
							dataType : "jsonp",
							success : (function(j, arando) { return function(more_data) {
								totaladded++;
								that.add(data.results[arando].trackName, data.results[arando].collectionName, data.results[arando].artistName, data.results[arando].artworkUrl100.substring(0, data.results[arando].artworkUrl100.length - 14) + '170x170-75.jpg', data.results[arando].trackViewUrl, data.results[arando].previewUrl, typeof more_data.feed.entry != 'undefined' ? $.merge($.map(more_data.feed.entry, function(val) {return val.link[0].href;}),['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0]) : ['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0], data.results[arando].trackId, typeof data.results[arando].collectionId != 'undefined' ? data.results[arando].collectionId : -1, typeof data.results[arando].artistId != 'undefined' ? data.results[arando].artistId : -1, false);
								if (totaladded == thismany) {
                                  if(burnit) {
                                    burnq = true;
                                    that.burnUrl();
                                  }
                                }
                               }; })(j, arando)
                               });
						}
					});
				}
					return true;
					}
                    return false;
				}
				
				that.shuffle = function () {
				  $('#list li').shuffle();
				}
				
			}

			function suggestRandomArtists(numartists) {
			  if (!$('#randoartists').length) {
			    $('#randos').after('<div id="randoartists"></div>');
			    $('#randoartists').hide();
			    suggestRandomArtists(numartists);
			  }
			  else {
			    $('#randoartists').fadeOut(200, function() { $('#randoartists').html(''); 
			      var displayedsuggestions = [];
			      var whichgenre, chosen, notinarrayq;
			      for (var i=0; i<numartists; i++) {
			        do {
			          whichgenre = Math.floor(Math.random()*ids.length);
			          chosen = ids[whichgenre][Math.floor(Math.random()*ids[whichgenre].length)];
			          if (notinarrayq = ($.inArray(chosen[0], displayedsuggestions) == -1)) {
			            displayedsuggestions.push(chosen[0]);
			            $('#randoartists').append('<span id="rando_' + chosen[0] + '"></span> ');
			            $('#rando_' +chosen[0]).html('+' + chosen[1]);
			            $('#rando_' +chosen[0]).click((function(chosenid) { return function() {songs.addArtist(chosenid, 10, false, true);};})(chosen[0]));
			          }
			         } while (!notinarrayq);
			       }
			       $('#randoartists').fadeIn(200);
			     });
			  }  
			}
			
			function hashies (which, numlimit) {
				               var datalength = ids[which].length;
				               for (var i=0; i<numlimit; i++) {
						      	songs.addArtist(ids[which][Math.ceil(Math.random()*(datalength-1))][0],1,false, false);
						      }
						    }
			
			function updatehash (label) {
			  reloadq = false;
			  $('#hash').html('#' + label);
			  window.location.hash = '#' + label;
			}
			

            function randommix () {
               toreload = Math.ceil(Math.random()*(reserved.length-2))+1;
                   window.location.hash = '#' + reserved[toreload];
                   window.location.reload();
            }
			/*<img border="0" id="copy" class="icons" src="copy.png" width="64" height="64" />*/
			function constructPage() {
			  $('body').append('<div id="tubecontainer"><div id="tube"></div><div id="belowflick"><a href="http://www.youtube.com/" target="_window"><img id="ytpowerimg" src="ytpower.png" height="39" width="60" border="0" /></a><span id="fail">Fail?</span></div></div>');
			  $('#fail').click(function() {globalindex=last_index; songs.getNewYouTube();});
			/*$('#tubecontainer').dialog({ dialogClass: 'notitle', show: {effect: 'slide', duration: 100, direction: 'right'}, draggable: false, autoOpen: false, resizable: false, create: function (event) { $(event.target).parent().css({'position': 'fixed', 'right' : '0'});}, position: ['right', 30], title: '', resize: function(event, ui) { $('#tube').css({
        position:'absolute',
        left: ($('#tubecontainer').width() - $('#tube').outerWidth())/2,
        top: ($('#tubecontainer').height() - $('#tube').outerHeight())/2
    }); }
});
$(window).resize(function() {
$( "#tubecontainer" ).dialog( "option", "position", ['right', 30]);
});*/
last_index = -1;
			    reloadq=false;
			    flickq=false;
thehash = window.location.hash;
			    $(window).on( 'hashchange', function() {if (reloadq) {window.location.reload();} reloadq=true;} );
			    loop = 2;
			    shufflestart = false;
			  $('body').append('<div id="topcontainer"><div id="top"><span id="brand">burn.fm/</span><span id="hash">'+ thehash + '</span><img border="0" id="stumbleupon" class="icons" src="su.png" width="62" height="62" /><img border="0" id="facebook" class="icons" src="facebook.png" width="64" height="64" /><img border="0" id="twitter" class="icons" src="twitter.png" width="64" height="64" /></div><div id="newrandom"><span id="new">>New</span><span id="random">>Random</span> <a id="visibility" href="https://twitter.com/#!/burndotfm" target="_window">@burndotfm</a></div><div id="playcontrols"><span id="shuffle">shuffle</span><span id="loop">loop list</span></div><div id="songcontainer"><input id="song" /></div><div id="randos"><span id="pop">+pop</span> <span id="hiphop">+hip hop</span> <span id="indierock">+indie rock</span> <span id="punk">+punk</span> <span id="underrated">+underrated</span> <span id="disco">+disco</span> <span id="funk">+funk</span> <span id="jazz">+jazz</span></div></div><div id="transition"></div>');
				$('#new').click(function() {window.location.hash = '#newmix'; window.location.reload();});
				$('#random').click(randommix);
				$('#shuffle').click(function() {
				  songs.shuffle();
				});
				$('#loop').click(function() {
				  if(loop == 0) {
				    loop = 1;
				    $('#loop').html('loop track');
				  }
				  else if(loop == 1) {
				    loop = 2;
				    $('#loop').html('loop list');
				  }
				  else if(loop == 2) {
				    loop = 0;
				    $('#loop').html('loop none');
				  }
				});
				$('#indierock').click(function() {  songs.addGenre(2,10,true);});
				$('#hiphop').click(function() {songs.addGenre(1,10,true);});
				$('#pop').click(function() {songs.addGenre(0,10,true);});
				$('#underrated').click(function() {songs.addGenre(3,10,true);});
				$('#disco').click(function() {songs.addGenre(4,10,true);});
				$('#funk').click(function() {songs.addGenre(5,10,true);});
				$('#punk').click(function() {songs.addGenre(7,10,true);});
				$('#jazz').click(function() {songs.addGenre(6,10,true);});
				//$('#brand').click(function() {window.location.hash = ''; window.location.reload();});
				$('#stumbleupon').click(function() {window.open('http://www.stumbleupon.com/submit?url=' + encodeURIComponent('http://burn.fm/' + thehash));});
				$('#facebook').click(function() {window.open('http://www.facebook.com/sharer.php?t=' + encodeURIComponent('A music playlist') + '&u=' + encodeURIComponent('http://burn.fm/' + thehash));});
				$('#twitter').click(function() {window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent('A music playlist') + '&url=' + encodeURIComponent('http://burn.fm/' + thehash));});
				suggestRandomArtists(7);
				s = setInterval(function(){suggestRandomArtists(7);},10000);
				$('body').append('<div id="content"></div>');
							$('#content').append('<ul id="list"><li id="addhere"><div class="item" id="insertionpoint"><span class="sort">o</span><span id="addheretext">[Where your next track(s) will go]</span></div></li></ul><div id="psa">This site saves just twenty people per day from ads and accounts on YouTube, Grooveshark, and Pandora. Tell your friends about Burn, and email whatever at burn dot fm with feedback.</div>');
					        $('#list').sortable({handle: '.sort', containment: 'document', axis: 'y', start: function(event, ui) {
					        flagged=0;
					        if($('#' + ui.item.context.id).next().next().attr('id') == 'addhere') {flagged=1;} else if ($('#' + ui.item.context.id).prev().attr('id') == 'addhere') {
					        flagged=2;
					        }
					        }, update: function(event, ui) { if(ui.item.context.id != 'addhere' && !((flagged==1 && $('#' + ui.item.context.id).prev().attr('id') == 'addhere') || (flagged==2 && $('#' + ui.item.context.id).next().attr('id') == 'addhere'))) songs.burnUrl();}});
				$('#song').watermark('Find a track to add', {className: ''});
				$('#song').addClass('ui-corner-all');
				$("#song").autocomplete({
					source : function(request, response) {
						$.ajax({
							url : "http://itunes.apple.com/search",
							dataType : "jsonp",
							data : {
								term : request.term,
								entity : "song",
								limit : 14
							},
							success : function(data) {
								response($.map(data.results, function(item) {
									return {
										label : item.trackName + ' | ' + item.collectionName + ' | ' + item.artistName,
										itunes_id : item.trackId,
										collection_id: item.collectionId,
										artist_id: item.artistId,
										song : item.trackName,
										album : item.collectionName,
										artist : item.artistName,
										album_art : item.artworkUrl100.substring(0, item.artworkUrl100.length - 14) + '170x170-75.jpg',
										value : item.name,
										itunes_url : item.trackViewUrl,
										preview_url : item.previewUrl
									}
								}));
							}
						});
					},
					minLength : 2,
					delay : 500,
					select : function(event, ui) {
						/*if(songs.isAdded(ui.item.itunes_id)) {
							alert('You\'ve already added that song! If you like it so much, why don\'t you marry it?');
							$('#song').val('');
							return false;
						}*/
						$.ajax({
							url : "http://gdata.youtube.com/feeds/api/videos?alt=json-in-script&format=5&max-results="+YOUTUBES,
							data: {
							  q: tube_top(ui.item.song, ui.item.artist)
							},
							dataType : "jsonp",
							success : function(data) {
							    burnq = true;
							    songs.add(ui.item.song, ui.item.album, ui.item.artist, ui.item.album_art, ui.item.itunes_url, ui.item.preview_url, typeof data.feed.entry != 'undefined' ? $.merge($.map(data.feed.entry, function(val) {return val.link[0].href;}),['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0]) : ['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0], ui.item.itunes_id, typeof ui.item.collection_id != 'undefined' ? ui.item.collection_id : -1, typeof ui.item.artist_id != 'undefined' ? ui.item.artist_id : -1,true);							
							}
						});
						$('#song').val("");
						return false;
					},
					open : function(event, ui) {
						$(this).removeClass("ui-corner-all").addClass("ui-corner-top");
						/*$("ul.ui-autocomplete li").each(function(){
        var htmlString = $(this).html().replace(/&lt;/g, '<');
        htmlString = htmlString.replace(/&gt;/g, '>');
        $(this).html(htmlString);
        });*/
					},
					close : function() {
						$(this).removeClass("ui-corner-top").addClass("ui-corner-all");
					}
				});
				
				/*.ui-autocomplete-loading {background: url('/icons/loading.gif') no-repeat right center;*/

			}

			if(window.location.hash.length > 1 && $.inArray(window.location.hash.slice(1), reserved) == -1) {
              if (window.location.hash.split('&').length==(2 || 3)) {
                $('body').prepend('<div id="hidehashinfo">' + window.location.hash + '</div>');
              }
              else if (top === self) {
                  $('body').prepend('<iframe id="hidehash" name="hidehash" style="display:none;" />');
                    $('#hidehash').load(function() {
                       var hidehashinfo = $('#hidehash').contents().find('#hidehashinfo').html();
                       if (hidehashinfo != null) components = hidehashinfo.split('&');
                       if (typeof components != 'undefined' && components[0] != '#') {
                       //if components exist and are valid, ...
                       	 theprev = components[1].slice(4);
                         $('#hidehash').remove();
                         $('body').prepend('<div id="loading"><span id="loadingtext">Loading</span> burn. . .</div>');
                         $.ajax({
						url : "http://itunes.apple.com/lookup?id=" + components[0].slice(1),
						dataType : "jsonp",
						success : function(data) {
                            songs = new Songs();
						    var function_queue = [];
						    for (var i=0; i<data.results.length; i++) {
						      $.ajax({
							url : "http://gdata.youtube.com/feeds/api/videos?alt=json-in-script&format=5&max-results=" + YOUTUBES,
							data: {
							  q: tube_top(data.results[i].trackName, data.results[i].artistName)
							},
							dataType : "jsonp",
							success : (function(i) { return function(more_data) {
								console.log(execute_function(songs.add, this, [data.results[i].trackName, data.results[i].collectionName, data.results[i].artistName, data.results[i].artworkUrl100.substring(0, data.results[i].artworkUrl100.length - 14) + '170x170-75.jpg',  data.results[i].trackViewUrl, data.results[i].previewUrl, typeof more_data.feed.entry != 'undefined' ? $.merge($.map(more_data.feed.entry, function(val) {return val.link[0].href;}),['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0]) : ['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0], data.results[i].trackId, typeof data.results[i].collectionId != 'undefined' ? data.results[i].collectionId : -1, typeof data.results[i].artistId != 'undefined' ? data.results[i].artistId : -1]));
								function_queue.push([i, execute_function(songs.add, this, [data.results[i].trackName, data.results[i].collectionName, data.results[i].artistName, data.results[i].artworkUrl100.substring(0, data.results[i].artworkUrl100.length - 14) + '170x170-75.jpg',  data.results[i].trackViewUrl, data.results[i].previewUrl, typeof more_data.feed.entry != 'undefined' ? $.merge($.map(more_data.feed.entry, function(val) {return val.link[0].href;}),['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0]) : ['http://www.youtube.com/watch?v=QgGbbVFMS4c&feature=youtube_gdata',0], data.results[i].trackId, typeof data.results[i].collectionId != 'undefined' ? data.results[i].collectionId : -1, typeof data.results[i].artistId != 'undefined' ? data.results[i].artistId : -1,true])]);
                                if (function_queue.length == data.results.length) {
                                  // Start populating burned page here
                                  jQuery.fx.off = true;
                                  function_queue = $.map(function_queue.sort(function(a, b) {return (b[0] - a[0]);}), function(a) {return a[1];});
                                  burnq=false;
                                  $('#loading').remove();
                                  constructPage();
                                  reloadq = true;
                                  while (function_queue.length > 0) {
                                    (function_queue.pop())();
                                  }
                                  burnq=true;
                                  $('html,body').scrollTop(0);
                                  jQuery.fx.off = false;
                                }
                               }; })(i)
                               });
						    }
						}
					});
                       }
                       else {
                         window.location.hash = '#newmix';
                         window.location.reload();
                       }
                    });
                    $('#hidehash').attr('src', 'http://d.burn.fm/' + window.location.hash.slice(1));
				}
			} else {
			    if (window.location.hash == '#random') {
			       randommix();
			    }
			    songs = new Songs();
			    constructPage();
			    switch (window.location.hash) {
                   case '#indierock':
songs.addGenre(2,20,false);
updatehash('indierock');
                   break;
                   case '#pop':
songs.addGenre(0,20,false);
updatehash('pop');
                   break;
                   case '#hiphop':
songs.addGenre(1,20,false);
updatehash('hiphop');
                   break;
                   case '#underrated':
songs.addGenre(3,20,false);
updatehash('underrated');
                   break;
                   case '#britney':
                   songs.addArtist(217005,20,false,false);
                   break;
                   case '#spoon':
                   songs.addArtist(703784,20,false,false);
                   break;
                   case '#rihanna':
                   songs.addArtist(63346553,20,false,false);
                   break;
                   case '#bieber':
                   songs.addArtist(320569549,20,false,false);
                   break;
                   case '#disco':
songs.addGenre(4,20,false);
updatehash('disco');
break;
                   case '#funk':
songs.addGenre(5,20,false);
updatehash('funk');
break;
case '#jazz':
songs.addGenre(6,20,false);
updatehash('jazz');
break;
case '#punk':
songs.addGenre(7,20,false);
updatehash('punk');
break;
                   default:
                   updatehash('newmix');
                   break;
			    }
thehash = window.location.hash;
			}