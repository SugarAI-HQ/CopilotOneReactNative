/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';

import {DevSettings, NativeModules} from 'react-native';

const addDebugMenuItems = async () => {
  const message = {
    stop: '(*) Stop Debugging',
    debug: '(*) Debug JS Remotely',
  };

  DevSettings.addMenuItem(message.debug, () => {
    NativeModules.DevSettings.setIsDebuggingRemotely(true);
  });
  DevSettings.addMenuItem(message.stop, () => {
    NativeModules.DevSettings.setIsDebuggingRemotely(false);
  });
};

export const enableDebugging = async () => {
  setTimeout(addDebugMenuItems, 100);
};

enableDebugging();
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  TextInput,
  Text,
  Button,
  FlatList,
  Dimensions,
  Switch,
  Modal,
  ScrollView,
} from 'react-native';

import {useCopilot, CopilotProvider} from '@sugar-ai/core';

import {VoiceAssistant} from '@sugar-ai/copilot-one-rn';
import {useTheme} from '@react-navigation/native';
// import {FilterType, SettingsType, TodoSchemaType} from './schema/todoSchema';

const windowHeight = Dimensions.get('window').height;
const maxHeight = windowHeight - 120;

enum recurringType {
  none,
  hourly,
  daily,
  weekly,
  monthly,
  yearly,
}

const copilotPackage = 'sugar/copilotexample/todoexample/0.0.3';

let copilotConfig = {
  // copilotId: "da82abb5-cf74-448b-b94d-7e17245cc5d9",
  copilotId: 'da82abb5-cf74-448b-b94d-7e17245cc5d9',
  server: {
    // endpoint: "https://play.sugarcaneai.dev/api",
    // token: "pk-m0j6E8CfMkedk0orAk0gXyALpOZULs3rSiYulaPFXd2rPlin",
    endpoint: 'https://play.sugarcaneai.dev/api',
    token: 'pk-m0j6E8CfMkedk0orAk0gXyALpOZULs3rSiYulaPFXd2rPlin',
  },

  ai: {
    defaultPromptTemplate: copilotPackage,
    defaultPromptVariables: {
      '#AGENT_NAME': 'Tudy',
    },
    successResponse: 'Task Done',
    failureResponse: 'I am not able to do this',
    voice: '',
    lang: 'hi-IN',
  },
  style: {
    container: {position: 'bottom-right'},
    theme: {primaryColor: '#3b83f6'},
    keyboardButton: {},
    toolTip: {
      welcomeMessage: 'Hi, I am John. How may I help you today?',
      delay: 1,
      disabled: false,
    },

    voiceButton: {},
  },
};

const TodoApp = () => {
  const {useStateEmbedding, registerAction, unregisterAction} = useCopilot();
  const [todos, setTodos] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highlightedSetting, setHighlightedSetting] = useState('');
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<FilterType>('all'); // Assuming FilterType is a string enum

  const addTodo = (task: string) => {
    // @ts-ignore
    setTodos(ts => [...ts, {task, id: ts.length + 1, completed: false}]);
  };

  registerAction(
    'addTodo',
    {
      name: 'addTodo',
      description: 'Add a new todo',
      parameters: [
        {
          name: 'task',
          type: 'string',
          description: 'Task description',
          required: true,
        },
      ],
    },
    addTodo,
  );

  const deleteTodo = (task: string) => {
    setTodos(
      (todos as any).filter(
        (todo: any) => todo.task.toLowerCase() !== task.toLowerCase(),
      ),
    );
  };

  registerAction(
    'deleteTodo',
    {
      name: 'deleteTodo',
      description: 'Delete a todo based on task comparison',
      parameters: [
        {
          name: 'task',
          type: 'string',
          description: 'Task to be deleted',
          required: true,
        },
      ],
    },
    deleteTodo,
  );

  const markTodoAsDone = (task: string) => {
    setTodos(
      (todos as any).map((todo: any) => {
        if (todo.task.toLowerCase() === task.toLowerCase()) {
          return {...todo, completed: !todo.completed}; // Toggle completed status
        }
        return todo;
      }),
    );
  };

  const markTodoAsDoneById = (todoId: number) => {
    setTodos(
      (todos as any).map((todo: any) => {
        if (todo.id == todoId) {
          return {...todo, completed: true};
        }
        return todo;
      }),
    );
  };

  registerAction(
    'markTodoAsDoneById',
    {
      name: 'markTodoAsDoneById',
      description: 'Mark a todo as done by its ID',
      parameters: [
        {
          name: 'todoId',
          type: 'number',
          description: 'ID of the todo to mark as done',
          required: true,
        },
      ],
    },
    markTodoAsDoneById,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // @ts-ignore
    addTodo(input, false, recurringType.none);
    setInput('');
  };

  const filterTodos = () => {
    if (!Array.isArray(todos)) {
      return [];
    }

    switch (filter) {
      case 'remaining':
        return todos.filter((todo: any) => !todo.completed);
      case 'done':
        return todos.filter((todo: any) => todo.completed);
      default:
        return todos;
    }
  };

  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <View style={{flex: 1}}>
      {/* Filter buttons */}

      {/* Todo Header */}
      <View style={{flex: 1, padding: 20}}>
        <Text>Todos ({todos.length})</Text>

        {/* Todo Input and Add Button */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Add a new todo"
            style={{flex: 1, borderBottomWidth: 1}}
          />
          <Button title="Add" onPress={handleSubmit} />
        </View>

        {/* Toggle Button */}
        <Switch
          value={isSettingsOpen}
          onValueChange={() => setIsSettingsOpen(!isSettingsOpen)}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}>
          <View style={{flexDirection: 'row'}}>
            <Button title="All" onPress={() => setFilter('all')} />
            <Button title="Remaining" onPress={() => setFilter('remaining')} />
            <Button title="Done" onPress={() => setFilter('done')} />
          </View>
          {/* Add some space */}
          <View style={{width: 20}} />
        </View>

        {/* Todo List */}
        <FlatList
          data={filterTodos()}
          renderItem={({item}) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <Switch
                  value={item.completed}
                  onValueChange={() => markTodoAsDone(item.task)}
                />
                <Text
                  style={{
                    flex: 1,
                    textDecorationLine: item.completed
                      ? 'line-through'
                      : 'none',
                    marginLeft: 10,
                  }}>
                  {item.task}
                </Text>
              </View>
              <Button title="Delete" onPress={() => deleteTodo(item.task)} />
            </View>
          )}
          keyExtractor={item => item.id.toString()}
        />

        {/* Settings Popup */}
        {isSettingsOpen && (
          <SettingsPopup
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            highlightedSetting={highlightedSetting}
          />
        )}
      </View>

      {/* Voice Assistant */}
      <VoiceAssistant
        id={'preview'}
        promptTemplate={copilotPackage}
        messageStyle={''}
        position={'bottom-right'}
      />
      {/* Render your Voice Assistant component here */}
    </View>
  );
};

const SettingsPopup = ({isOpen, onClose, highlightedSetting}) => {
  return (
    <View style={[styles.container, isOpen ? null : styles.hidden]}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} />
      <View style={styles.popup}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Settings</Text>
          <TouchableOpacity onPress={onClose}>
            <Text>Close</Text> {/* Wrap "Close" text in a Text component */}
          </TouchableOpacity>
        </View>
        <View style={styles.list}>
          <ListItem
            title="Notifications"
            highlighted={highlightedSetting === 'notifications'}
          />
          <ListItem
            title="Dark Mode"
            highlighted={highlightedSetting === 'dark_mode'}
          />
          <ListItem
            title="Sound effects"
            highlighted={highlightedSetting === 'sound_effects'}
          />
          <ListItem
            title="Auto Expire"
            highlighted={highlightedSetting === 'auto_expire'}
          />
          <ListItem
            title="Recurring on"
            highlighted={highlightedSetting === 'recurring_on'}
          />
        </View>
      </View>
    </View>
  );
};

const ListItem = ({title, highlighted}) => {
  return (
    <View style={[styles.listItem, highlighted ? styles.highlighted : null]}>
      <Text>{title}</Text>
      <Switch value={false} /> {/* Assuming you'll handle the switch state */}
    </View>
  );
};

function App(): React.JSX.Element {
  return (
    <>
      <CopilotProvider config={copilotConfig}>
        {/* <TextAssistant
          id={'preview'}
          promptTemplate={copilotPackage}
          messageStyle={''}
          position={'bottom-right'}
        /> */}
        <TodoApp />
      </CopilotProvider>
    </>
    // <>
    //   <View style={styles.viewCopilotContainer}>
    //     <TouchableOpacity style={styles.viewKeyboardButton} />

    //     <View style={styles.viewChatMessage}>
    //       <Text style={styles.viewMessage}>
    //         Lorem Ipsum is simply dummy text of the printing and typesetting
    //         industry. Lorem Ipsum has been the industry's standard dummy text
    //         ever since the 1500s, when an unknown printer took a galley of type
    //         and scrambled it to make a type specimen book. It has survived not
    //         only five centuries, but also the leap into electronic typesetting,
    //         remaining essentially unchanged
    //       </Text>

    //       <Text style={styles.viewMessage}>
    //         Lorem Ipsum is simply dummy text of the printing and typesetting
    //         industry. Lorem Ipsum has been the industry's standard dummy text
    //         ever since the 1500s, when an unknown printer took a galley of type
    //         and scrambled it to make a type specimen book. It has survived not
    //         only five centuries, but also the leap into electronic typesetting,
    //         remaining essentially unchanged
    //       </Text>
    //     </View>
    //   </View>
    //   <View style={styles.viewTextBoxContainer}>
    //     <TextInput style={styles.viewTextBox} />
    //     {/* <TouchableOpacity style={styles.viewTextBoxButton} /> */}
    //   </View>
    // </>
  );
}

export default App;

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

// const styles = StyleSheet.create({
//   viewCopilotContainer: {
//     position: 'absolute',
//     zIndex: 1000,
//     margin: 0,
//     bottom: 20,
//     right: 20,
//   },
//   viewChatMessage: {
//     position: 'absolute',
//     width: DEVICE_WIDTH - 60,
//     // maxHeight: DEVICE_HEIGHT - 120,
//     backgroundColor: '#ffffff',
//     borderRadius: 10,
//     // overflow: 'hidden',
//     zIndex: 1000,
//     elevation: 5,
//     right: 10,
//     bottom: 60,
//   },
//   viewVoiceButton: {
//     backgroundColor: '#4CAF50',
//     padding: 10,
//     borderRadius: 50,
//     marginLeft: 15,
//   },
//   viewKeyboardButton: {
//     position: 'relative',
//     backgroundColor: '#2196F3',

//     width: 50,
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 25,
//     elevation: 3,
//   },
//   viewButtonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 10,
//     marginBottom: 10,
//   },
//   viewMessage: {
//     padding: 10,
//     paddingTop: 0,
//   },
//   viewToolTipContainer: {
//     backgroundColor: '#f9f9f9',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   viewToolTipMessage: {
//     fontSize: 16,
//     color: '#333',
//   },
//   viewTextBoxContainer: {
//     backgroundColor: '#f2f2f2',
//     borderRadius: 25,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   viewTextBox: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     fontSize: 16,
//     color: '#333',
//   },
//   viewTextBoxButton: {
//     backgroundColor: '#007AFF',
//     borderRadius: 25,
//     padding: 10,
//     marginRight: 10,
//   },
//   viewKeyboardEmptyContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    display: 'none',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
  },
  highlighted: {
    backgroundColor: 'yellow',
  },
});
