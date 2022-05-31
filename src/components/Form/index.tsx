import React, { useState } from 'react';
import { ArrowLeft } from 'phosphor-react-native';
import {
  View,
  TextInput,
  Image,
  Text,
  TouchableOpacity
} from 'react-native';
import { captureScreen } from 'react-native-view-shot'
import * as FileSystem from 'expo-file-system'

import { FeedbackType } from '../Widget';
import { ScreenshotButton } from '../Screenshot';
import { theme } from '../../theme';
import { feedbackTypes } from '../../utils/feedbackTypes';
import { styles } from './styles';
import { Button } from '../Button';
import { api } from '../../libs/api';

interface Props {
  feedbackType: FeedbackType;
  onFeedbackCanceled: () => void;
  onFeedbackSent: () => void
}

export function Form({ feedbackType, onFeedbackCanceled, onFeedbackSent }: Props) {
  const { title, image } = feedbackTypes[feedbackType]
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [isSendingFeedback, setIsSendingFeedback] = useState(false)

  async function handleScreenshot() {
    try {
      const uri = await captureScreen({
        format: 'png',
        quality: 0.8
      })
      setScreenshot(uri)
    } catch (error) {
      console.log(error)
    }
  }

  function handleScreenshotRemove() {
    setScreenshot(null)
  }

  async function handleSendFeedback() {
    if(isSendingFeedback) {
      return;
    }

    setIsSendingFeedback(true)

    try {
      const screenshotBase64 = screenshot && await FileSystem.readAsStringAsync(screenshot, { encoding: 'base64' })

      await api.post('/feedbacks', {
        type: feedbackType,
        comment,
        screenshot: `data:image/png;base64,${screenshotBase64}`,
      })

      onFeedbackSent()
      
    } catch (error) {
      console.log(error)
      setIsSendingFeedback(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header} >
        <TouchableOpacity onPress={onFeedbackCanceled} >
          <ArrowLeft
            size={24}
            weight='bold'
            color={theme.colors.text_secondary}
          />
        </TouchableOpacity>

        <View style={styles.titleContainer} >
          <Image
            source={image}
            style={styles.image}
          />
          <Text style={styles.titleText} >
            {title}
          </Text>
        </View>

      </View>

      <TextInput 
        style={styles.input}
        multiline
        placeholder='Conte com detalhes o que está acontecendo...'
        placeholderTextColor={theme.colors.text_secondary}
        autoCorrect={false}
        onChangeText={(text) => setComment(text)}
      />

      <View style={styles.footer} >
        <ScreenshotButton 
          screenshot={screenshot}
          onTakeShot={handleScreenshot}
          onRemoveShot={handleScreenshotRemove}
        />

        <Button isLoading={isSendingFeedback} onPress={handleSendFeedback} />
      </View>
    </View>
  );
}