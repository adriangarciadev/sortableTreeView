
	import { render } from 'react-dom'
	import {Preprocess as Example}  from './example'
  import {Controls} from './example'
	import { DndProvider } from 'react-dnd'
	import { HTML5Backend } from 'react-dnd-html5-backend'
  import { useState, useRef} from 'react';
  import reactDom from 'react-dom' 


  let tree = {
    isRoot:true,
    children:
    [
        {
            text:"My documents",
            id:1,
            children:[{
                text:"My videos",
                id:4,
                children:[],
                fileType:"file"
            },
            {
                text:"My pictures",
                id:5,
                children:[]
            }]
        },
        {
            text:"child 2",
            id:2,
            children:[]
        },
        {
            text:"child 3",
            id:3,
            children:[]
        },
        {
          text:"child 0",
          id:0,
           children:[]
      },
      {
        text:"child -1",
        id:-1,
         children:[]
    }
    
    ]};
    
    console.log("FROM APP : " + JSON.stringify(tree))




	function App() {

    const callback = useRef({});

		return (
			<div className="App">
				<DndProvider backend={HTML5Backend}>
					<Example tree={tree} name={"testTree"} options={{mode:"drop", gutterTop:1.0, gutterBottom:1}} callback={callback}/>
				</DndProvider>
        <div>
          <CallbackVisualizer callback={callback}/>
        </div>
			</div>

		)
	}

  const CallbackVisualizer = ({callback})=>
  {
    const [areaState, setArea] = useState("");

    const handleClick =()=>{

      console.log("callback test " +JSON.stringify(callback.current.getData()))
      setArea(JSON.stringify(callback.current.getData(), undefined, 4));
    }

    return(
      <>
      <button onClick={handleClick}>Get the tree</button>
      <textarea value={areaState} />
      
    </>
    );
  }

	const rootElement = document.getElementById('root')
	render(<App />, rootElement)
