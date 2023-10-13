import React, { useEffect, useRef, useState } from 'react';
import ACTIONS from '../actions';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import toast from 'react-hot-toast';

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [clients, setClients] = useState([]);

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const [codee, setCodee] = useState('');

  useEffect(() => {
    function handleErrors(err) {
      console.log('socket error', err);
      toast.error('socket connection failed, try again');
    }

    async function init() {
      socketRef.current = await initSocket();

      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username, //sent from homepage through react router
      });

      //listening join event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            //don't notify me
            toast.success(`${username} joined the room`);
          }

          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    }

    init();

    return () => {
      //cleanup
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED); //unsubscribing socket event
      socketRef.current.off(ACTIONS.DISCONNECTED); //unsubscribing socket event
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard?.writeText(roomId);
      toast.success('Room ID copied to your clipboard');
    } catch (error) {
      console.log(error);
      toast.error("Couldn't copy Room ID");
    }
  }

  function leaveRoom() {
    navigate('/');
  }

  if (!location.state) {
    return <Navigate to={'/'} />;
  }
  var output = document.getElementById('output');
  var input = document.getElementById('input');
  const handlePythonBtn = async function () {
    var code = {
      code: codee,
      input: input.value,
    };
    // console.log(code);
    var oData = await fetch('http://localhost:5002/compile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(code),
    });
    var d = await oData.json();
    // console.log(d);
    output.value = d.output;
  };
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/images/logo.png" alt="logo" />
          </div>
          <br />
          <h3 style={{ color: 'white' }}>Connected</h3>
          <br />

          <div className="clientsList">
            {clients.length > 0 &&
              clients.map((client) => (
                <div className="clientName" key={client.socketId}>
                  {client.username}
                </div>
              ))}
          </div>
        </div>
        <button onClick={copyRoomId} className="btn copyBtn">
          Copy Room ID
        </button>
        <button onClick={leaveRoom} className="btn leaveBtn">
          Leave
        </button>
      </div>

      <div className="editorWrap">
        <Editor
          onCodeChange={(code) => {
            setCodee(code);
            return (codeRef.current = code);
          }}
          roomId={roomId}
          socketRef={socketRef}
        />
      </div>
      <div className="pythonrun">
        {/* {codee} */}
        <button onClick={handlePythonBtn} className="btn pythonBtn">
          Python : ▶️ Run
        </button>
        <label>
          <h4 style={{ color: 'white' }}>Input</h4>
        </label>
        <textarea id="input" className="pyInput"></textarea>
        <label>
          <h4 style={{ color: 'white' }}>Output</h4>
        </label>
        <textarea id="output" className="pyOutput"></textarea>
      </div>
    </div>
  );
};

export default EditorPage;
