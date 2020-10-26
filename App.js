import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  StatusBar,
  Alert,
  Platform,
  Dimensions
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import MapView, { PROVIDER_GOOGLE, Marker, Heatmap, Circle, Polyline, Polygon, Callout } from 'react-native-maps'

import Geolocation from '@react-native-community/geolocation';
import {request, PERMISSIONS} from 'react-native-permissions';
import Carousel from 'react-native-snap-carousel';


export default class App extends Component {

state = { 
  markers: [],
  coordinates: [
    { name: 'Burger', latitude: 37.420978, longitude: -122.119732, image: require('./src/img/burger.jpg') },
    { name: 'Pizza', latitude: 37.424073, longitude: -122.114822, image: require('./src/img/pizza.jpg') },
    { name: 'Soup', latitude: 37.422735, longitude: -122.112301, image: require('./src/img/soup.jpg') },
    { name: 'Sushi', latitude: 37.420017, longitude:  -122.110069, image: require('./src/img/sushi.jpg') },
    { name: 'Curry', latitude:  37.417819, longitude: -122.114285, image: require('./src/img/curry.jpg') },
  ]
}

componentDidMount() 
{
  this.requestLocationPermission();
}

showWelcomeMessage = () =>
Alert.alert(
  'Welcome to San Francisco',
  'The food is amazing',
  [
    {
      text: 'Cancel',
      style: 'cancel'
    },
    {
      text: 'Ok'
    }
  ]
)

requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    var response = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    console.log('IPhone' + response);
    if (response === 'granted') {
      this.locateCurrentPosition();
    }
  } else {
    var response = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    console.log('Android' + response);
    if (response === 'granted') {
      this.locateCurrentPosition();
    }
  }
}

locateCurrentPosition = () => { 
  Geolocation.getCurrentPosition(
    position => {
      console.log(JSON.stringify(position));
      let initPosition = {
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude,
          latitudeDelta: 0.09,
          longitudeDelta: 0.035,
      }
      this.setState({initPosition } );
    },
    error => Alert.alert(error.message),
    {enableHighAccuracy: true, timeout:10000, maximumAge:1000}
  )
}

onCarouselItemChange = (index) => {
  let location = this.state.coordinates[index];

  this._map.animateToRegion({
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.09,
    longitudeDelta: 0.035
  })

  this.state.markers[index].showCallout()
}

onMarkerPressed = (location, index) => {
  console.log('onMarkerPressed')
  this._map.animateToRegion({
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.09,
    longitudeDelta: 0.035
  });

  this._carousel.snapToItem(index);
}

renderCarouselItem = ({ item }) =>
<View style={styles.cardContainer}>
  <Text style={styles.cardTitle}>{item.name}</Text>
  <Image style={styles.cardImage} source={item.image} />
</View>

  render() {
    return (
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={map => this._map = map}
          showsUserLocation={true}
          style={styles.map}
          initialRegion={this.state.initPosition}
         
        > 
          <Polygon coordinates={this.state.coordinates} />
          <Marker 
              draggable
              coordinate={{ latitude: 37.405437, longitude: -122.099661}}
              image={require('./src/img/sushi.png')} >
            <Callout>
              <Image source={require('./src/img/sushi.png')} />
              <Text>An Interesting city</Text>
            </Callout>
            </Marker>
            {
            this.state.coordinates.map((marker, index) => (
              <Marker
                key={marker.name}
                ref={ref => this.state.markers[index] = ref}
                onPress={() => this.onMarkerPressed(marker, index)}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              >
                <Callout>
                  <Text>{marker.name}</Text>
                </Callout>

              </Marker>
            ))
          }

        </MapView>
        <Carousel
          ref={(c) => { this._carousel = c; }}
          data={this.state.coordinates}
          containerCustomStyle={styles.carousel}
          renderItem={this.renderCarouselItem}
          sliderWidth={Dimensions.get('window').width}
          itemWidth={300}
          removeClippedSubviews={false}
          onSnapToItem={(index) => this.onCarouselItemChange(index)}
        />
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  carousel: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 48
  },
  cardContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    height: 200,
    width: 300,
    padding: 24,
    borderRadius: 24
  },
  cardImage: {
    height: 120,
    width: 300,
    bottom: 0,
    position: 'absolute',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  cardTitle: {
    color: 'white',
    fontSize: 22,
    alignSelf: 'center'
  }
})