import React, { useState } from 'react';
import { Image, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useCamera } from 'react-native-camera-hooks';
import RNFetchBlob from 'rn-fetch-blob';
import Tts from 'react-native-tts';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
// import * as googleTTS from 'google-tts-api';

const {height: screenHeight, width: screenWidth} = Dimensions.get('window');

const Camera = () => {
  const [{cameraRef}, {takePicture}] = useCamera(null); 
  const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back); 
  const [ratio, setRatio] = useState('16:9');  
  const [imagePadding, setImagePadding] = useState(0);//(screenHeight - screenWidth / 9 * 16) / 2);
  const [photo, setPhoto] = useState(null); 

  const playSound = (path) => { 
    const sound = new Sound(path, Sound.MAIN_BUNDLE, (error) => { 
      if (error) { 
        console.log('failed to load the sound', error); 
        return; 
      }

      sound.play((success) => { 
        if (success) { 
          console.log('play ok'); 
        } else { 
          console.log('ngu'); 
        }
      })
    }); 
  }

  const text2speech = (text) => { 
    const googleTTS = require('google-tts-api'); 
    const Sound = require('react-native-sound'); 
    // console.log(RNFS.DocumentDirectoryPath);
    const path = RNFS.DocumentDirectoryPath + 'a.mp3'; 
    // console.log('path: ', path); 

    googleTTS
      .getAudioBase64(text, {
        lang: 'vi',
        slow: false,
        host: 'https://translate.google.com',
        timeout: 10000,
      })
      .then((resp) => { 
        RNFS.writeFile(path, resp, 'base64').then(() => playSound(path))
      }) 
      .catch(console.error);
  }

  const captureHandle = async () => { 
    const options = {
      quality: 1,
      base64: true,
      width: 600,
      height: 600,
    };

    const dataPhoto = await takePicture(options); 
    setPhoto(dataPhoto);  

    let arr = dataPhoto.uri.split('/').pop(); 

    // Call API text
    RNFetchBlob.fetch('POST', 'http://13.215.251.198:80/detect', {
      'Content-Type' : 'multipart/form-data',
    }, [
      { 
        name: 'img_file',
        filename : arr, 
        data: RNFetchBlob.wrap(dataPhoto.uri) 
      },
    ]).then((resp) => {
      let dataJson = resp.json().content.split('\n').join(' '); 
      dataJson = dataJson.slice(0, dataJson.length / 2).split(' ');
      console.log(dataJson);
      let subStr = ''; 
      let subStrArr = []; 
      for (let i = 0; i < dataJson.length; ++i) { 
        subStr += dataJson[i] + ' '; 
        if (i == dataJson.length - 1 || i % 20 == 19) { 
          subStrArr.push(subStr); 
          subStr = '';  
        }
      }
      console.log('talk: ', subStrArr[0]);
      text2speech(subStrArr[0]);
    }).catch((err) => {
      console.error(err);
    })

    setTimeout(() => {}, 2000);

    // Call API captioning
    RNFetchBlob.fetch('POST', 'http://54.212.173.26:80/caption', {
      'Content-Type' : 'multipart/form-data',
    }, [
      { 
        name: 'img_file',
        filename : arr, 
        data: RNFetchBlob.wrap(dataPhoto.uri) 
      },
    ]).then(async (resp) => {
      console.log('caption: ', resp.json()); 
      let dataJson = resp.json().content; 
      text2speech(dataJson);  
    }).catch((err) => {
      console.error(err);
    })

  }

  const previewPhoto = () => {  
    if (photo) { 
      return ( 
        <Image source={{uri: photo.uri}} style={{height: 100, width: 100, position: 'absolute', top: 100}}/>
      ); 
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <RNCamera
        style={[styles.cameraPreview, {marginTop: imagePadding, marginBottom: imagePadding}]}
        ref={cameraRef}
        type={cameraType} 
        ratio={ratio}> 
          <View style={styles.cameraBar}>
            <TouchableOpacity  style={styles.buttonTPBorder} onPress={captureHandle}> 
              <View style={styles.buttonTP}/>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.flipCameraBackG}
              onPress={() => setCameraType(cameraType === RNCamera.Constants.Type.back ? 
                                                  RNCamera.Constants.Type.front : 
                                                  RNCamera.Constants.Type.back)}> 
              <Image style={styles.flipImage} source={require('../assets/flip-camera.png')}/>
            </TouchableOpacity>
          </View>
      </RNCamera>
      {/* { previewPhoto() } */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },  
  cameraPreview: {
    flex: 1,
  }, 
  cameraBar: { 
    position: 'absolute',
    bottom: 0,
    height: screenHeight * 0.11, 
    width: screenWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center', 
    justifyContent: 'center', 
    alignContent: 'center', 
  }, 
  buttonTP: { 
    height: screenHeight * 0.073, 
    width: screenHeight * 0.073, 
    backgroundColor: 'white', 
    borderRadius: screenHeight * 0.04
  }, 
  buttonTPBorder: { 
    height: screenHeight * 0.085, 
    width: screenHeight * 0.085, 
    borderRadius: screenHeight * 0.05,
    borderWidth: screenHeight * 0.003, 
    borderColor: 'white',
    alignItems: 'center', 
    justifyContent: 'center', 
    alignContent: 'center', 
  }, 
  preview: { 
    flex: 1,
    alignSelf: 'stretch',
  }, 
  flipCameraBackG: { 
    height: screenHeight * 0.06, 
    width: screenHeight * 0.06, 
    borderRadius: screenHeight * 0.03, 
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    position: 'absolute', 
    left: '15%',
    alignItems: 'center', 
    justifyContent: 'center', 
    alignContent: 'center', 
  },
  flipImage: { 
    height: screenHeight * 0.05, 
    width: screenHeight * 0.05, 
  }
});

export default Camera;
