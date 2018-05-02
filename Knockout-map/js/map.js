//=========== Model ============//
// These are the locations listings that will be shown to the user.
var locations = [{
        title: 'Riyadh',
        location: {
            lat: 24.713552,
            lng: 46.675296
        }
    },
    {
        title: 'Jeddah',
        location: {
            lat: 21.285407,
            lng: 39.237551
        }
    },
    {
        title: 'Hail',
        location: {
            lat: 27.51141,
            lng: 41.720824
        }
    },
    {
        title: 'Abha',
        location: {
            lat: 18.246469,
            lng: 42.511724
        }
    },
    {
        title: 'Khobar',
        location: {
            lat: 26.217191,
            lng: 50.197138
        }
    }
];



var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413549,
            lng: -73.9980244
        },
        zoom: 10
    });

    function drop() {
        clearMarkers();
        for (var i = 0; i < locations.length; i++) {
            addMarkerWithTimeout(locations[i], i * 200);
        }
    }

    function addMarkerWithTimeout(position, timeout) {
        window.setTimeout(function() {
            markers.push(new google.maps.Marker({
                position: position,
                map: map,
                animation: google.maps.Animation.BOUNCE
            }));
        }, timeout);
    }

    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }


    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    function listen(marker) {
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            // call

            //getMyWikiData(this, largeInfowindow);
        });
        // instead of:

        // animate marker here ('this' is the marker object here)

    }

    // The following group uses the location array to create an array of markers on initialize.
    var makeMarkerBounce = null;
    var clickableListener = function() {
        if (makeMarkerBounce !== null)
            makeMarkerBounce.setAnimation(null);
        if (makeMarkerBounce != this) {
            this.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                makeMarkerBounce.setAnimation(null);
            }, 2000);
            makeMarkerBounce = this;
        } else
            makeMarkerBounce = null;
    };
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
            content: ''
        });
        vm.locationList()[i].marker = marker;
        // Push the marker to our array of markers.
        markers.push(marker);
        listen(marker);
        // Create an onclick event to open an infowindow at each marker.
        bounds.extend(markers[i].position);

        google.maps.event.addListener(marker, 'click', clickableListener);

    }

    getInfo();
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);

}


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.content + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.setMarker = null;
        });
    }
    //Bounce animation will be applied on the marker once clicked.
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}



// Search Bar to filter cities
var ViewModel = function() {
    // http://knockoutjs.com/documentation/computedObservables.html#managing-this

    var self = this;

    this.locationList = ko.observableArray(locations);

    this.locationList().forEach(function(city) {
        city.title.visible = ko.observable(true);
    });

    this.query = ko.observable('');

    // A ko computed watches other observable for changes
    this.searchFilters = ko.computed(function() {
        var search = self.query().toLowerCase();
        return self.locationList().filter(function(loc) {
            var isMatching = loc.title.toLowerCase().indexOf(search) >= 0; // true or false
            if (loc.marker) loc.marker.setVisible(isMatching);
            return isMatching;
        });
    });

    // http://knockoutjs.com/documentation/click-binding.html#note-1-passing-a-current-item-as-a-parameter-to-your-handler-function
    this.ListItemClicked = function(locationListItem) {
        //console.log('click')
        console.log(locationListItem);

        // locationListItem.marker will activate the corresponding map marker, when clicked on the list 
        google.maps.event.trigger(locationListItem.marker, 'click');

    };

};

var vm = new ViewModel();

ko.applyBindings(vm);

//this function is used to call getWikiContent to display content inside the info window
function getInfo() {
    for (var i = 0; i < markers.length; i++) {
        console.log(markers[i].getTitle());
        getWikiContent(markers[i]);
    }
}

// this function will invoke ajax request to get content from wikipedia
// and display it inside the info window for each city once the location pin is clicked
function getWikiContent(marker) {
    $.ajax({
        url: "https://en.wikipedia.org/w/api.php",
        data: {
            format: "json",
            action: "opensearch",
            search: marker.getTitle(),
        },
        dataType: 'jsonp',
        headers: {
            'Api-User-Agent': 'MyCoolTool/1.1 (http://example.com/MyCoolTool/; MyCoolTool@example.com) BasedOnSuperLib/1.4'
        },
        success: function(data) {

            marker.content = data[2][0];

        },
        timeout: 5000,
        //in case of an error, this function will display an error message
        error: function(errorMessage) {
            alert("Wikipedia API Error");
            marker.content = 'Error getting the data';
        }

    });
}


// a fallback error handling function 
function mapErrorHandlingMsg() {
    alert('There is an error while loading the map');
}