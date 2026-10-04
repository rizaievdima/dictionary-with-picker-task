import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Image,
  Pressable,
  Alert,
} from "react-native";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";

import { wordsLearningActions } from "../../store/wordsLearningSlice";

import { getWordInfo } from "../../services/wordsHandler";
import Ionicons from "@expo/vector-icons/Ionicons";
import { playSound } from "../../services/soundHandler";

function AddWord({ navigation }) {
  const [image, setImage] = useState();
  const [text, setText] = useState();
  const [wordData, setWordData] = useState();
  const [permissionInfo, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const colors = useSelector((state) => state.theme.colors);
  const styles = useMemo(() => getStyles(colors), [colors]);
  const dispatch = useDispatch();

  async function verifyPermissions() {
    if (permissionInfo?.status === ImagePicker.PermissionStatus.GRANTED) {
      return true;
    }

    const permissionResult = await requestPermission();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required."
      );
      return false;
    }
    return true;
  }

  async function pickImage() {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }

  function onChangeText(text) {
    setWordData(undefined);
    setText(text);
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (text) {
        const wordDataReceived = await getWordInfo(text);
        setWordData(wordDataReceived);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [text]);

  useEffect(() => {
    navigation.setOptions({
      title: wordData?.word ? `Adding word "${wordData.word}"` : `Adding word`,
    });
  }, [navigation, wordData]);

  function onAdd() {
    dispatch(wordsLearningActions.addWord({ ...wordData, image }));
    navigation.navigate("AllWords");
  }

  return (
    <>
      <View style={styles.inputContainer}>
        <Pressable
          style={[styles.imagePicker, !wordData?.word && { opacity: 0.5 }]}
          disabled={!wordData?.word}
          onPress={pickImage}
        >
          {image ? (
            <Image style={styles.image} source={{ uri: image }} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                No image taken yet.
              </Text>
            </View>
          )}
        </Pressable>
        <Text style={styles.label}>Your word to search:</Text>
        <TextInput
          style={styles.input}
          onChangeText={onChangeText}
          value={text}
          placeholder="type here.."
          placeholderTextColor={colors.grey600}
        />
      </View>
      {wordData && (
        <View style={styles.receivedInfoContainer}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={styles.word}>{wordData.word}</Text>
            {wordData.audio && (
              <Pressable
                style={styles.playPressable}
                onPress={() => playSound(wordData.audio)}
              >
                <Ionicons
                  name="volume-medium-outline"
                  size={28}
                  color={colors.primary900}
                />
              </Pressable>
            )}
            <Text style={styles.phonetics}>{wordData.phonetics}</Text>
          </View>
          <Text style={styles.partOfSpeech}>{wordData.partOfSpeech}</Text>
          <Text style={styles.meaning}>{wordData.meaning}</Text>
          {wordData.word && (
            <Pressable style={styles.buttonContainer} onPress={onAdd}>
              <Text style={{ fontSize: 24, color: colors.fontInverse }}>
                Add
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </>
  );
}

function getStyles(colors) {
  return StyleSheet.create({
    input: {
      height: 40,
      fontSize: 18,
      borderColor: colors.primary200,
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      color: colors.fontMain,
    },
    label: {
      fontSize: 12,
      color: colors.grey600,
      marginBottom: 4,
    },
    inputContainer: {
      marginHorizontal: 12,
    },
    receivedInfoContainer: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 10,
      fontSize: 32,
    },
    word: {
      fontSize: 32,
      paddingHorizontal: 10,
      color: colors.fontMain,
    },
    phonetics: {
      fontSize: 20,
      paddingHorizontal: 10,
      color: colors.fontMain,
    },
    partOfSpeech: {
      fontSize: 20,
      paddingHorizontal: 10,
      color: colors.fontMain,
    },
    meaning: {
      fontSize: 16,
      padding: 13,
      color: colors.fontMain,
    },
    buttonContainer: {
      borderRadius: 4,
      backgroundColor: colors.primary900,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    backPressable: {
      position: "absolute",
      width: 60,
      borderRadius: 30,
      aspectRatio: 1,
      top: "2%",
      left: "2%",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    playPressable: {
      marginHorizontal: 20,
    },
    imagePicker: {
      width: 150,
      aspectRatio: 1,
      alignSelf: "center",
      marginVertical: 10,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
    },
    imagePlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderStyle: "dashed",
      borderRadius: 8,
      borderColor: colors.primary200,
    },
    imagePlaceholderText: {
      color: colors.grey600,
    },
  });
}

export default AddWord;
