import { CompareNode } from './basic/compare/Compare.react';
import { TimerNode } from './basic/timer/Timer.react';
import { NumberNode } from './basic/number/Number.react';
import { NotNode } from './basic/not/Not.react';
import { AndNode } from './basic/and/And.react';
import { OrNode } from './basic/or/Or.react';
import { ToggleNode } from './basic/toggle/Toggle.react';
import { CounterNode } from './basic/counter/Counter.react';
import { ComputeNode } from './basic/compute/Compute.react';

import { Random } from './advanced/random/Random.react';
import { ScaleNode } from './advanced/scale/Scale.react';
import { FilterNode } from './advanced/filter/Filter.react';
import { RoundNode } from './advanced/round/Round.react';
import { FunctionNode } from './advanced/function/Function.react';

import { ElWiresNode } from './electronic/elWires/ElWires.react';
import { DisplayNode } from './electronic/display/Display.react';
import { LEDNode } from './electronic/led/LED.react';
import { ServoNode } from './electronic/servo/Servo.react';
import { UltrasonicNode } from './electronic/ultrasonic/Ultrasonic.react';
import { ButtonNode } from './electronic/button/Button.react';
import { LightsensorNode } from './electronic/lightsensor/Lightsensor.react';
import { MotorsNode } from './electronic/motors/Motors.react';
import { SegdisplayNode } from './electronic/segdisplay/Segdisplay.react';
import { KnobNode } from './electronic/knob/Knob.react';
import { LinefollowerNode } from './electronic/linefollower/Linefollower.react';
import { HumitureNode } from './electronic/humiture/Humiture.react';
import { TemperatureNode } from './electronic/temperature/Temperature.react';
import { SoundSensorNode } from './electronic/soundSensor/SoundSensor.react';
import { JoystickNode } from './electronic/joystick/Joystick.react';
import { LedpanelNode } from './electronic/ledpanel/Ledpanel.react';
import { PirNode } from './electronic/pir/Pir.react';
import { BuzzerNode } from './electronic/buzzer/Buzzer.react';
import { LEDStripNode } from './electronic/ledStrip/LEDStrip.react';
import { GyroSensorNode } from './electronic/gyroSensor/GyroSensor.react';
import { SoilMoistureNode } from './electronic/soilMoisture/SoilMoisture.react';
import { ColorSensorNode } from './electronic/colorSensor/ColorSensor.react';
import { VoiseRecognitionNode } from './electronic/voiseRecognition/VoiseRecognition.react';
import { FunnyTouchNode } from './electronic/funnyTouch/FunnyTouch.react';


import { DelayNode } from './time/delay/Delay.react';
import { Pulse } from './time/pulse/Pulse.react';
import { TodayNode } from './time/today/Today.react';
import { NowNode } from './time/now/Now.react';
import { HoldNode } from './time/hold/Hold.react';
import { AverageNode } from './time/average/Average.react';
import { SequenceNode } from './time/sequence/Sequence.react';

import { ControlButton } from './control/controlButton/ControlButton.react';
import { ControlToggleNode } from './control/controlToggle/ControlToggle.react';
import { ControlIndicatorNode } from './control/controlIndicator/ControlIndicator.react';
import { ControlLabelNode } from './control/controlLabel/ControlLabel.react';
import { ControlTextInputNode } from './control/controlTextInput/ControlTextInput.react';
import { ControlNumberInputNode } from './control/controlNumberInput/ControlNumberInput.react';
import { ControlSlider } from './control/controlSlider/ControlSlider.react';
import { ControlLineGraph } from './control/controlLineGraph/ControlLineGraph.react';

import { ServoAngleNode } from './assist/servo/servoAngle/ServoAngle.react';
import { MergeTextNode } from './assist/display/mergeText/MergeText.react';
import { TextNode } from './assist/display/text/Text.react';
import { FaceNode } from './assist/display/face/Face.react';
import { ColorCheckNode } from './assist/colorSensor/colorCheck/ColorCheck.react';
import { COLORNode } from './assist/led/color/Color.react';
import { ImageNode } from './assist/led/image/Image.react';
import { PatternNode } from './assist/led/pattern/Pattern.react';
import { MotorspeedNode } from './assist/motor/motorspeed/Motorspeed.react';
import { SteeringwheelNode } from './assist/motor/steeringwheel/Steeringwheel.react';
import { RGBMixNode } from './assist/led/rgbMix/RGBMix.react';
import { VoiceCommandNode } from './assist/voiceCommand/VoiceCommand.react';

import { RecordNode } from './sound/record/Record.react';
import { PlaySoundNode } from './sound/playSound/PlaySound.react';
import { PlayMusicNode} from './sound/playMusic/PlayMusic.react';
import { TextToSpeechNode } from './sound/textToSpeech/TextToSpeech.react';
import { SpeakerRecognizeNode } from './assist/record/speakerRecognizeNode/SpeakerRecognize.react';
import { SaveRecordNode } from './assist/record/saveRecord/SaveRecord.react';
import { MatchTextNode } from './assist/speakerRecognize/matchText/MatchText.react';

import { EmotionTestNode } from './camera/emotionTest/EmotionTest.react';
import { OCRNode } from './camera/OCR/OCR.react';
import { SnapshotNode } from './camera/snapshot/Snapshot.react';
import { PhotoFrameNode } from './camera/photoFrame/PhotoFrame.react';

import { MusicNoteNode } from './assist/musicNote/MusicNote.react';

import {SmartServo} from './electronic/smartServo/SmartServo.react';
import {SmartServoAction} from './assist/smartServo/smartServoAction/SmartServoAction.react';

let factory = {
  'COMPARE': CompareNode,
  'TIMER': TimerNode,
  'NUMBER': NumberNode,
  'NOT': NotNode,
  'AND': AndNode,
  'OR': OrNode,
  'TOGGLE': ToggleNode,
  'COUNTER': CounterNode, 
  'COMPUTE': ComputeNode,
  'FUNNYTOUCH': FunnyTouchNode,
  'VOISERECOGNITION': VoiseRecognitionNode,
  'COLORSENSOR': ColorSensorNode,
  'SOIL_HUMIDITY': SoilMoistureNode,
  'ACCELEROMETER_GYRO': GyroSensorNode,
  'PIR': PirNode,
  'BUZZER': BuzzerNode,
  'ELWIRES': ElWiresNode,
  'OLED_DISPLAY': DisplayNode,
  'LED': LEDNode,
  'SERVO': ServoNode,
  'ULTRASONIC': UltrasonicNode,
  'BUTTON': ButtonNode,
  'LIGHTSENSOR':LightsensorNode,
  'MOTORS': MotorsNode,
  'KNOB': KnobNode,
  'LINEFOLLOWER': LinefollowerNode,
  'HUMITURE': HumitureNode,
  'TEMPERATURE': TemperatureNode,
  'SOUNDSENSOR': SoundSensorNode,
  'JOYSTICK':JoystickNode,
  'LEDPANEL':LedpanelNode,
  'SEGDISPLAY': SegdisplayNode,
  'SERVOANGLE': ServoAngleNode,
  'MERGETEXT': MergeTextNode,
  'TEXT': TextNode,
  'FACE': FaceNode,
  'COLORCHECK': ColorCheckNode,
  'COLOR': COLORNode,
  'RGBMIX': RGBMixNode,
  'MOTORSPEED': MotorspeedNode,
  'STEERINGWHEEL': SteeringwheelNode,
  'IMAGE':ImageNode,
  'PATTERN':PatternNode,
  'VOICECOMMAND': VoiceCommandNode,
  'PULSE': Pulse,
  'RANDOM': Random,
  'SCALE': ScaleNode,
  'FILTER': FilterNode,
  'ROUND': RoundNode,
  'FUNCTION': FunctionNode,
  'LEDSTRIP': LEDStripNode,
  'DELAY': DelayNode,
  'TODAY': TodayNode,
  'NOW': NowNode,
  'HOLD': HoldNode,
  'AVERAGE': AverageNode,
  'SEQUENCE': SequenceNode,

  'CONTROLBUTTON': ControlButton,
  'CONTROLTOGGLE': ControlToggleNode,
  'INDICATOR': ControlIndicatorNode,
  'LABEL': ControlLabelNode,
  'TEXT_INPUT': ControlTextInputNode,
  'NUMBER_INPUT': ControlNumberInputNode,
  'SLIDER': ControlSlider,
  'LINE_GRAPH': ControlLineGraph,

  'RECORD': RecordNode,
  'PLAYSOUND': PlaySoundNode,
  'SPEAKERRECOGNIZE': SpeakerRecognizeNode,
  'SAVERECORD': SaveRecordNode,
  'PLAYNOTES': PlayMusicNode,
  'TEXTTOSPEECH': TextToSpeechNode,
  'MATCHTEXT': MatchTextNode,

  'EMOTION_TEST': EmotionTestNode,
  'OCR': OCRNode,
  'PHOTO_FRAME': PhotoFrameNode,
  'SNAPSHOT': SnapshotNode,

  'MUSICNOTE': MusicNoteNode,

  'SMARTSERVO': SmartServo,
  'SMARTSERVOACTION': SmartServoAction
};

export default factory;
