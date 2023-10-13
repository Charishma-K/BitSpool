import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  function handleEnterKeyPress(e) {
    if (e.code === 'Enter') joinRoom();
  }

  function createNewRoom(e) {
    e.preventDefault();

    const id = uuidv4();
    setRoomId(id);

    toast.success('Created a New Room');
  }

  function joinRoom() {
    if (!roomId || !username) {
      toast.error('Room ID and Username is required');
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  }

  return (
    <div className="homePageWrapper">
      <div className="area">
        <div>
          <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
        <div className="formWrapper">
          <img className="homePageLogo" src="/images/logo.png" alt="logo" />
          <h4 className="mainLabel">Paste Invitation RoomID</h4>
          <div className="inputGroup">
            <input
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleEnterKeyPress}
              value={roomId}
              placeholder="ROOM ID"
              className="inputBox"
              type="text"
            />
            <input
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleEnterKeyPress}
              value={username}
              placeholder="USERNAME"
              className="inputBox"
              type="text"
            />
            <button onClick={joinRoom} className="btn joinBtn">
              Join
            </button>
            <span className="createInfo">
              If you don't have an invite then &nbsp;
              <a onClick={createNewRoom} href="#" className="createNewBtn">
                Create New Room
              </a>
            </span>
            <img
              style={{
                background: '#fff',
                paddingTop: '10px',
                alignContent: 'center',
              }}
              src="/home_page.svg"
              alt="My SVG"
            />
          </div>
        </div>

        <footer>
          <h4 className="footer">
            Built with 💛 by &nbsp;
            <a
              className="text-green"
              href="https://www.linkedin.com/in/raghava-donthoju/"
            >
              &nbsp;Raghava Donthoju
            </a>
          </h4>
        </footer>
      </div>
    </div>
  );
};

export default Home;
