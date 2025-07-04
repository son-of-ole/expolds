import { Picker as ExPicker } from '@expo/ui/swift-ui';
import { Picker } from '@react-native-picker/picker';
import * as Speech from 'expo-speech';
import * as React from 'react';
import {
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import HeadingText from '../components/HeadingText';
import { Colors } from '../constants';

const EXAMPLES = [
  { language: 'en', text: 'Hello world' },
  { language: 'es', text: 'Hola mundo' },
  { language: 'en', text: 'Charlie Cheever chased a chortling choosy child' },
  { language: 'en', text: 'Adam Perry ate a pear in pairs in Paris' },
];

const AmountControlButton: React.FunctionComponent<
  React.ComponentProps<typeof TouchableOpacity> & {
    title: string;
  }
> = (props) => (
  <TouchableOpacity
    disabled={props.disabled}
    onPress={props.onPress}
    hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
    <Text
      style={{
        color: props.disabled ? '#ccc' : Colors.tintColor,
        fontWeight: 'bold',
        paddingHorizontal: 5,
        fontSize: 18,
      }}>
      {props.title}
    </Text>
  </TouchableOpacity>
);

const audioSessionOptions = [
  { label: 'unspecified', value: undefined },
  { label: 'false', value: false },
  { label: 'true', value: true },
];

interface State {
  selectedExample: { language: string; text: string };
  inProgress: boolean;
  paused: boolean;
  useApplicationAudioSession: boolean | undefined;
  pitch: number;
  rate: number;
  voiceList?: { name: string; identifier: string }[];
  voice?: string;
}

export default class TextToSpeechScreen extends React.Component<object, State> {
  static navigationOptions = {
    title: 'Speech',
  };

  readonly state: State = {
    selectedExample: EXAMPLES[0],
    inProgress: false,
    paused: false,
    useApplicationAudioSession: undefined,
    pitch: 1,
    rate: 0.75,
  };

  async componentDidMount() {
    await this._loadAllVoices();
  }

  render() {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <HeadingText>Select a phrase</HeadingText>

        <View style={styles.examplesContainer}>{EXAMPLES.map(this._renderExample)}</View>

        <View style={styles.separator} />

        <View style={styles.controlRow}>
          <Button disabled={this.state.inProgress} onPress={this._speak} title="Speak" />

          <Button disabled={!this.state.inProgress} onPress={this._stop} title="Stop" />
        </View>

        {Platform.OS === 'ios' && (
          <View style={styles.controlRow}>
            <Button
              disabled={!this.state.inProgress || this.state.paused}
              onPress={this._pause}
              title="Pause"
            />
            <Button disabled={!this.state.paused} onPress={this._resume} title="Resume" />
          </View>
        )}

        {this.state.voiceList && (
          <Picker
            selectedValue={this.state.voice}
            onValueChange={(voice) => this.setState({ voice })}>
            {this.state.voiceList.map((voice) => (
              <Picker.Item key={voice.identifier} label={voice.name} value={voice.identifier} />
            ))}
          </Picker>
        )}

        <Text style={styles.controlText}>Pitch: {this.state.pitch.toFixed(2)}</Text>
        <View style={styles.controlRow}>
          <AmountControlButton
            onPress={this._increasePitch}
            title="Increase"
            disabled={this.state.inProgress}
          />

          <AmountControlButton
            onPress={this._decreasePitch}
            title="Decrease"
            disabled={this.state.inProgress}
          />
        </View>

        <Text style={styles.controlText}>Rate: {this.state.rate.toFixed(2)}</Text>
        <View style={styles.controlRow}>
          <AmountControlButton
            onPress={this._increaseRate}
            title="Increase"
            disabled={this.state.inProgress}
          />

          <Text>/</Text>
          <AmountControlButton
            onPress={this._decreaseRate}
            title="Decrease"
            disabled={this.state.inProgress}
          />
        </View>
        {Platform.OS === 'ios' && (
          <>
            <Text>useApplicationAudioSession</Text>
            <View style={styles.controlRow}>
              <ExPicker
                variant="segmented"
                options={audioSessionOptions.map((option) => option.label)}
                selectedIndex={audioSessionOptions.findIndex(
                  (option) => option.value === this.state.useApplicationAudioSession
                )}
                onOptionSelected={({ nativeEvent: { index } }) => {
                  const useApplicationAudioSession = audioSessionOptions[index].value;
                  this.setState({
                    useApplicationAudioSession,
                  });
                }}
              />
            </View>
          </>
        )}
      </ScrollView>
    );
  }

  _speak = () => {
    const start = () => {
      this.setState({ inProgress: true });
    };
    const complete = () => {
      this.state.inProgress && this.setState({ inProgress: false, paused: false });
    };

    Speech.speak(this.state.selectedExample.text, {
      voice: this.state.voice,
      language: this.state.selectedExample.language,
      pitch: this.state.pitch,
      rate: this.state.rate,
      useApplicationAudioSession: this.state.useApplicationAudioSession,
      onStart: start,
      onDone: complete,
      onStopped: complete,
      onError: complete,
    });
  };

  _loadAllVoices = async () => {
    const availableVoices = await Speech.getAvailableVoicesAsync();
    this.setState({
      voiceList: availableVoices,
      voice: availableVoices[0].identifier,
    });
  };

  _stop = () => {
    Speech.stop();
  };

  _pause = async () => {
    await Speech.pause();
    this.setState({ paused: true });
  };

  _resume = () => {
    Speech.resume();
    this.setState({ paused: false });
  };

  _increasePitch = () => {
    this.setState((state) => ({
      ...state,
      pitch: state.pitch + 0.1,
    }));
  };

  _increaseRate = () => {
    this.setState((state) => ({
      ...state,
      rate: state.rate + 0.1,
    }));
  };

  _decreasePitch = () => {
    this.setState((state) => ({
      ...state,
      pitch: state.pitch - 0.1,
    }));
  };

  _decreaseRate = () => {
    this.setState((state) => ({
      ...state,
      rate: state.rate - 0.1,
    }));
  };

  _renderExample = (example: { language: string; text: string }, i: number) => {
    const { selectedExample } = this.state;
    const isSelected = selectedExample === example;

    return (
      <TouchableOpacity
        key={i}
        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
        onPress={() => this._selectExample(example)}>
        <Text style={[styles.exampleText, isSelected && styles.selectedExampleText]}>
          {example.text} ({example.language})
        </Text>
      </TouchableOpacity>
    );
  };

  _selectExample = (example: { language: string; text: string }) => {
    this.setState({ selectedExample: example });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 0,
    marginBottom: 15,
  },
  exampleText: {
    fontSize: 15,
    color: '#ccc',
    marginVertical: 10,
  },
  examplesContainer: {
    paddingTop: 15,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  selectedExampleText: {
    color: 'black',
  },
  resultText: {
    padding: 20,
  },
  errorResultText: {
    padding: 20,
    color: 'red',
  },
  button: {
    ...Platform.select({
      android: {
        marginBottom: 10,
      },
    }),
  },
  controlText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});
