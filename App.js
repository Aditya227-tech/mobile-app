import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { View, FlatList, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// HomeScreen component
function HomeScreen({ navigation }) {
  const categories = [
    { id: '1', title: 'Action', image: 'https://example.com/action.jpg' },
    { id: '2', title: 'Romance', image: 'https://example.com/romance.jpg' },
    { id: '3', title: 'Comedy', image: 'https://example.com/comedy.jpg' },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => navigation.navigate('Detail', { category: item })}
    >
      <Image source={{ uri: item.image }} style={styles.thumbnail} />
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
      />
    </View>
  );
}

// DetailScreen component
function DetailScreen({ route }) {
  const { category } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

  const webtoon = {
    id: '1',
    title: 'Sample Webtoon',
    image: 'https://example.com/sample-webtoon.jpg',
    description: 'This is a sample webtoon in the ' + category.title + ' category.',
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = favorites ? JSON.parse(favorites) : [];
      
      if (isFavorite) {
        favoritesArray = favoritesArray.filter(fav => fav.id !== webtoon.id);
      } else {
        favoritesArray.push(webtoon);
      }
      
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: webtoon.image }} style={styles.image} />
      <Text style={styles.title}>{webtoon.title}</Text>
      <Text style={styles.description}>{webtoon.description}</Text>
      <TouchableOpacity style={styles.button} onPress={toggleFavorite}>
        <Text style={styles.buttonText}>
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// FavoritesScreen component
function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.favoriteItem}
      onPress={() => navigation.navigate('Detail', { webtoon: item })}
    >
      <Image source={{ uri: item.image }} style={styles.thumbnail} />
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

// VoteScreen component
function VoteScreen() {
  const initialVotes = {
    'Webtoon A': 0,
    'Webtoon B': 0,
    'Webtoon C': 0,
  };

  const [votes, setVotes] = useState(initialVotes);

  const handleVote = (webtoon) => {
    setVotes(prevVotes => ({
      ...prevVotes,
      [webtoon]: prevVotes[webtoon] + 1
    }));
  };

  const data = {
    labels: Object.keys(votes),
    datasets: [{
      data: Object.values(votes)
    }]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vote for Your Favorite Webtoon</Text>
      {Object.keys(votes).map((webtoon) => (
        <TouchableOpacity
          key={webtoon}
          style={styles.button}
          onPress={() => handleVote(webtoon)}
        >
          <Text style={styles.buttonText}>Vote for {webtoon}</Text>
        </TouchableOpacity>
      ))}
      <BarChart
        data={data}
        width={300}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
}

// MainTabs component
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Vote" 
        component={VoteScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  categoryItem: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  thumbnail: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});