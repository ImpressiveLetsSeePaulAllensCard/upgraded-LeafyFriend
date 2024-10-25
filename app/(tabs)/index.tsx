import React, { useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getImages, deleteImage } from '@/app/utils/database';
import TopBar from '@/components/TopBar';
import { Button, Menu, Provider as PaperProvider, useTheme } from 'react-native-paper';
import { makeStyles } from '@/app/res/styles/gardenStyles'; // Import the styles
import Modal from 'react-native-modal';


export default function GardenScreen() {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [images, setImages] = useState<{ name: string, uri: string, species: string }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ name: string, uri: string, species: string } | null>(null);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  //used for scrollview in plant modal:
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  
  useFocusEffect(
    useCallback(() => {
      getImages(setImages);
    }, [])
  );

  const handleImageClick = (image: { name: string, uri: string, species: string }) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const handleDeleteImage = () => {
    if (selectedImage) {
      Alert.alert(
        'Delete Image',
        'Are you sure you want to delete this image?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteImage(selectedImage.uri);
              setImages(images.filter(image => image.uri !== selectedImage.uri));
              setModalVisible(false);
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

    //
    const handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollOffset(event.nativeEvent.contentOffset.y);
    };
  
    const handleScrollTo = (p: { x?: number; y?: number; animated?: boolean }) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo(p);
      }
    };
    
  

  const handleSort = (criteria: 'name' | 'species') => {
    const sortedImages = [...images].sort((a, b) => a[criteria].localeCompare(b[criteria]));
    setImages(sortedImages);
    setSortMenuVisible(false); // Close the menu after selection
  };

  const openSortMenu = () => setSortMenuVisible(true);
  const closeSortMenu = () => setSortMenuVisible(false);

  const handleSettingsPress = () => {
    alert('Settings button pressed');
  };

  return (
    <View style={styles.container}>
      <TopBar title="My Garden" showSettings={true} onSettingsPress={handleSettingsPress} />

      {/* Sort Dropdown Menu */}
      <View style={styles.menuContainer}>
        <Menu
          visible={sortMenuVisible}
          onDismiss={closeSortMenu}
          anchor={
            <Button mode="contained" onPress={openSortMenu} style={styles.sortButton}>
              Sort
            </Button>
          }
        >
          <Menu.Item onPress={() => handleSort('name')} title="Sort by Name" />
          <Menu.Item onPress={() => handleSort('species')} title="Sort by Species" />
        </Menu>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {images.map((image, index) => (
          <TouchableOpacity key={index} onPress={() => handleImageClick(image)}>
            <View style={styles.plantContainer}>
              <Image source={{ uri: image.uri }} style={styles.plantImage} />
              <Text style={styles.plantName}>{image.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>


{/* Modal for full image view and plant information*/}

<Modal
  isVisible={modalVisible}
  onSwipeComplete={() => setModalVisible(false)}
  swipeDirection={['down']}
  scrollTo={handleScrollTo}
  scrollOffset={scrollOffset}
  propagateSwipe={true}
  scrollOffsetMax={400} // Adjust based on your content height
  style={styles.modalStyle}
  onBackdropPress={() => setModalVisible(false)}
>
  <View style={styles.modalContent}>
  {selectedImage && (
  <>
    <ScrollView
      ref={scrollViewRef}
      onScroll={handleOnScroll}
      scrollEventThrottle={16}
      contentContainerStyle={styles.scrollViewContent}
    >
      <Image source={{ uri: selectedImage.uri }} style={styles.fullImage} />
      <Text style={styles.modalText}>Plant Name: {selectedImage.name}</Text>

      <Text style={styles.modalText}>Plant Species: {selectedImage.species}</Text>


    <Text style={styles.modalText}>Description: {selectedImage.description || 'Description not available'}</Text>
    <Text style={styles.modalText}>Watering: {selectedImage.watering || 'Watering information not available'}</Text>
    <Text style={styles.modalText}>Water every: {selectedImage.wateringValue || 'N/A'} {selectedImage.wateringUnit || ''}</Text>
    <Text style={styles.modalText}>Poisonous to Humans: {selectedImage.poisonousToHumans ? 'Yes' : 'No information'}</Text>
    <Text style={styles.modalText}>Poisonous to Pets: {selectedImage.poisonousToPets ? 'Yes' : 'No information'}</Text>
    <Text style={styles.modalText}>Scientific Name: {selectedImage.scientificName || 'Scientific name not available'}</Text>
    <Text style={styles.modalText}>Family: {selectedImage.family || 'Family information not available'}</Text>
    <Text style={styles.modalText}>Sunlight: {selectedImage.sunlight || 'Sunlight requirements not available'}</Text>

    </ScrollView>
    <View style={styles.modalButtonContainer}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeleteImage}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </>
)}

  </View>
</Modal>



{      /* End of Garden Screen */}
    </View>
  );
}