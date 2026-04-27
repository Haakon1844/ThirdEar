import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');

  // a demo in case if you are struggling with loading data from the mockup server
  const [data, setData] = useState([]);
  const isMounted = useRef(true);
  // load data from mockup server when the component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          'http://localhost:3000/comments'
        );
        const data = await response.json();
        console.log('Fetched comments:', data);
        if (isMounted.current) {
          setData(data);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, []);

  const addComment = () => {
    if (commentText !== '') {
      setComments([...comments, { text: commentText, replies: [] }]);
      setCommentText('');
    }
  };

  const addReply = (index) => {
    if (replyText !== '') {
      let updatedComments = [...comments];
      updatedComments[index].replies.push(replyText);
      setComments(updatedComments);
      setReplyText('');
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.commentContainer}>
      <Text style={styles.commentText}>{item.text}</Text>

      <View style={styles.replyContainer}>
        {item.replies.map((reply, i) => (
          <Text key={i} style={styles.replyText}>
            {reply}
          </Text>
        ))}
      </View>

      <View style={styles.replyInputContainer}>
        <TextInput
          style={styles.replyInput}
          value={replyText}
          onChangeText={setReplyText}
          placeholder='Reply to this comment'
          onSubmitEditing={() => addReply(index)}
        />
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => addReply(index)}
        >
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.subContainer}
          behavior='padding'
          enabled
        >
          <FlatList
            style={styles.commentsList}
            data={comments}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={commentText}
              onChangeText={setCommentText}
              placeholder='Add a comment'
              onSubmitEditing={addComment}
            />
            <TouchableOpacity style={styles.addButton} onPress={addComment}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subContainer: {
    flex: 1,
  },
  commentsList: {
    flex: 1,
    marginBottom: 10,
  },
  commentContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  commentText: {
    fontSize: 16,
  },
  replyContainer: {
    marginVertical: 5,
  },
  replyText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    fontSize: 14,
  },
  replyButton: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 14,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
  },
});

export default App;
