import React from 'react';
import { Text, View, Dimensions, Image } from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window'); 

const Splash = ({navigation}) => { 
    setTimeout(() => {
        navigation.navigate('Camera');  
    }, 3000);

    return(
        <View style = {{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', backgroundColor: 'cyan' }}>   
            <Image style={{width: screenWidth * 0.3, height: screenWidth * 0.3}} source={require('../assets/logo.png')}/>
        </View>
    ); 
}

export default Splash; 