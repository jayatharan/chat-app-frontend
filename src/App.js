import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Container, Form, Row, Col, Card, ListGroup, InputGroup, FormControl } from 'react-bootstrap';
import { Scrollbars } from 'react-custom-scrollbars-2';
import axios from './axios'
import { ref } from "firebase/database";
import { useObject } from 'react-firebase-hooks/database';
import {database} from './firebase'
import { getMessaging, getToken } from "firebase/messaging";
import { Geolocation } from '@capacitor/geolocation';

const webpush = require('web-push');


function App() {

  const scrollbar = useRef()

  const [loc, setLoc] = useState(null);
  var coordinates = null;
  const getCurrentPosition = useCallback(async () => {
    coordinates = await Geolocation.getCurrentPosition();
    setLoc(coordinates);
  }, [coordinates]);

  const [name,setName] = useState("")
  const [messageId,setMessageId] = useState("")
  const [messageName,setMessageName] = useState("")
  const [userName,setUserName] = useState("")
  const [message,setMessage] = useState(null)
  const [messages,setMessages] = useState([])
  const [text,setText] = useState("")
  const [chats,setChats] = useState([])

  const getMessages = ()=>{
    axios.get(`/${name}`)
    .then((res)=>{
      setMessages(res.data)
    }).catch((err)=>{
      console.log("Error")
    })
  }

  const getMessageData = ()=>{
    axios.get(`/message/${messageId}`)
    .then((res)=>{
      setMessage(res.data)
    }).catch((err)=>{
      console.log("Error")
    })
  }

  const getmessageChats = ()=>{
    axios.get(`/message/${messageId}/chats`)
    .then((res)=>{
      setChats(res.data)
    }).catch((err)=>{
      console.log("Error")
    })
  }

  const createMessage = ()=>{
    if(name && messageName){
      axios.post(`/message`,{
        "name":messageName,
        "users":[name]
      }).then((res)=>{
        setMessageName("")
        getMessages()
      }).catch((err)=>{
        console.log("Error")
      })
    }
  }

  const addUserToMessage = ()=>{
    if(userName && messageId){
      axios.post(`/message/${messageId}/add_user`,{
        "name":userName
      }).then((res)=>{
        setUserName("")
        getMessageData()
      }).catch((err)=>{
        console.log("Error")
      })
    }
  }

  const sendMessage = ()=>{
    if(text&&messageId&&name){
      axios.post(`/message/${messageId}`,{
        "user":name,
        "message":text
      }).then((res)=>{
        setText("")
        getmessageChats()
      }).catch((err)=>{
        console.log("Error")
      })
    }
  }

  useEffect(() => {
    if(name){
      getMessages()
    }
  }, [name])

  useEffect(() => {
    if(messageId){
      getMessageData()
      getmessageChats()
    }
  }, [messageId])

  // useEffect(() => {
  //   getToken(messaging, {validkey:"BFIka0XgoIUXa1Odm3sF3nr02yD013RO9lFpH56ipIFkgEd16DmntcjpBS9-oKoj6-eGNZUOzFT-0MFgOqk_rcI"})
  //   .then((currentToken)=>{
  //     if(currentToken){
  //       console.log(currentToken)
  //       Axios.post('/token',{
  //         "user":name,
  //         "token":currentToken
  //       })
  //       .then((res)=>{
  //         console.log("Token Updated")
  //       })
  //       .catch((err)=>{
  //         console.log("Error")
  //       })
  //     }else {
  //       console.log('No registration token available. Request permission to generate one.');
  //     }
  //   }).catch((err) => {
  //     console.log('An error occurred while retrieving token. ', err);
  //   });
  // }, [message])

  return (
    <Container>
      <h3>Chat App</h3>
      <Button onClick={getCurrentPosition}>Get Coordinates</Button>
      <p>Your location is:</p>
      <p>Latitude: {loc?.coords.latitude}</p>
      <p>Longitude: {loc?.coords.longitude}</p>
      <Row>
        <Col xs={12} sm={12} md={12} lg={4}>
          <Card className="p-1">
            <Form.Group as={Row} className="mb-3" controlId="name">
              <Form.Label column xs="3">
                Name
              </Form.Label>
              <Col xs="9">
                <Form.Control type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
              </Col>
            </Form.Group>  
            <h5>Messages</h5>
            <Form.Group as={Row} className="mb-3" controlId="messageName">
              <Col xs="7">
                <Form.Control type="text" value={messageName} onChange={e=>setMessageName(e.target.value)} placeholder="Message Name" />
              </Col>
              <Col xs="5">
                <Button onClick={createMessage} className="py-0" >Add Message</Button>
              </Col>
            </Form.Group> 
            {messages.map((msg)=>(
              <Card className="px-1 mb-1" onClick={()=>setMessageId(msg._id)}>
                <Card.Title>
                  {msg.name}
                </Card.Title>
              </Card>
            ))}
          </Card>
        </Col>
        <Col xs={12} sm={12} md={12} lg={5}>
          {message&&(
            <Chats message={message} chats={chats} setText={setText} name={name} text={text} sendMessage={sendMessage} getmessageChats={getmessageChats} />
          )}
        </Col>
        <Col xs={12} sm={12} md={12} lg={3}>
          {message&&(
            <Card className="p-1">
              <Card.Title>
                <h5>{message.name}</h5>
              </Card.Title>
              <Card.Body>
                <p><b>Users:</b></p>
                <Form.Group className="mb-3" controlId="messageName">
                    <Form.Control type="text" value={userName} onChange={e=>setUserName(e.target.value)} placeholder="User Name" />
                    <Button className="py-0" onClick={addUserToMessage} >Add User</Button>
                </Form.Group>
                <ListGroup>
                  {message.users.map(u=>(
                    <ListGroup.Item className="py-1">{u}</ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

function Chats({name,message,chats,setText,text,sendMessage,getmessageChats}){

  var realTimeMessage = useObject(ref(database, `messages/${message._id}`));

  useEffect(() => {
    getmessageChats()
  }, [realTimeMessage])

  return(
    <Card className="p-1">
      <h5>Messages</h5>
      <Scrollbars
          autoHide 
          autoHideTimeout={100} 
          autoHideDuration={100} 
          style={{ height: "70vh" }} 
          className="mt-0"  
      >
        {message&&(
          <>
            {chats.map((msg)=>(
              <Card className="px-1 mt-1">
                <small>{msg.user}</small>
                <p className="mb-0">{msg.message}</p>
              </Card>
            ))}
          </>
        )}
      </Scrollbars>
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Message"
          value={text}
          onChange={(e)=>setText(e.target.value)}
        />
        <Button variant="outline-secondary" id="send" onClick={sendMessage}>
          Send
        </Button>
      </InputGroup>
    </Card>
  )
}

export default App;
