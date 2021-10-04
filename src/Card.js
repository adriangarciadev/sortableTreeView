import React from 'react';
import { useRef } from 'react';
import { useState, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import './Treeview.css'; // Tell webpack that Button.js uses these styles

const style = {
    //  border: '1px dashed gray',
      /*paddingTop: '0.5rem',
      paddingRight: '0.0rem',
      paddingBottom: '0.0rem',
      paddingLeft: '1.0rem',
      position:'relative',
      boxSizing:'border-box',
      width:'400px',
  
      marginBottom: '0.0rem',
      backgroundColor: 'white',
      cursor: 'move',*/
  };
  

  //getting remsize once, might have to be recalculated on root size change....
    const remSize = window.getComputedStyle(document.documentElement)['font-size'].replace("px","");



const Card = ({idx, id, card, text, index,    parent, timestamp, fileType, API, config, expanded, sons}) => {

    
    //console.log("rendered : " + text + " idx: " + idx + " remSize: " +remSize +" config : "+JSON.stringify(config));
    
    const [update, setUpdate] = useState(Date.now());
    const [stateQuadrant, updateQuadrant] = useState(0);

    const tryToMove = (item, monitor)=>
    {
      

        if(!isOverCurrent)return;

              
        if (!ref.current) {
            return;
        }
        API.tryToSwapNodes(item.idx, idx, stateQuadrant);

    }
    
    const ref = useRef(null);
    const quadrantRef = useRef(null);
    
    const [{  handlerId, isOver, isOverCurrent }, drop] = useDrop({
        accept: ItemTypes.file.id,
        collect(monitor) {
        
        return {
                handlerId: monitor.getHandlerId(),
                isOver: monitor.isOver(),
                isOverCurrent: monitor.isOver({ shallow: true })
            };
        },
        drop(item, monitor){
            
            if(config.mode ==="drop")
            {
                tryToMove(item, monitor);


            }
        },
        hover(item, monitor) {


            if (!ref.current) {
                return;
            }
            if (item.idx === idx) {
                return;
            }


            //if file mode
   

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            const height = hoverBoundingRect.bottom - hoverBoundingRect.top;
            const width = hoverBoundingRect.left - hoverBoundingRect.right;
            // Get vertical middle
            const hoverMiddleX = width / 2;
            const hoverMiddleY = height / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientX = clientOffset.x - hoverBoundingRect.left;
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
       
            let quadrant = (hoverClientY> hoverMiddleY?2:0)   + (hoverClientX<hoverMiddleX?1:2); 


            /**
             *  doing a state update here BUT it won't be done on mouse move but on quadrant change.
             */
            //

            if(hoverClientY > remSize*config.gutterTop && hoverClientY < (height - remSize*config.gutterBottom))
            {
                quadrant = 5;
            }

            if(config.treeType ==="file")
            {
                //if hover isn't a folder
                if(fileType != ItemTypes.folder.id && quadrant === 5)
                {
                    return;
                }
            }

            if(quadrant !== stateQuadrant)
            {
                //state change for cosmetic effects to take hold.
                updateQuadrant( quadrant );
            }


            //don't change on hover if the mode is not hover
            if(config.mode !=="hover")
                return;

            tryToMove(item, monitor)




        }
    });
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.file.id,
        item: () => {
            return { id, index, parent, setUpdate, idx };
        },
        collect(monitor) {
           
            return {
            isDragging: monitor.isDragging(),
            };
            
        },
    });
    const opacity = isDragging ? 0 : 1;
    
    const getBG = ()=>
    {


       if(!isOverCurrent || config.mode=="hover")
            return 'white';

    }

    //const backgroundColor = getBG();//isOverCurrent? 'red':'blue';
   
   
 
    drag(drop(ref));



    style.paddingLeft=config.gutterLeft+"rem";
    style.paddingTop=config.gutterTop+"rem";
    style.paddingBottom=config.gutterBottom+"rem";

    const drawTopHandle = ()=>
    {
        if(isOverCurrent && (stateQuadrant === 1 || stateQuadrant === 2))
        {

            const topHandleStyle = 
            {
                position:'absolute',
                height:remSize*config.gutterTop+'px',
                width:'100%',
                backgroundColor:'#6097CE',
                marginTop:'-'+config.gutterTop+'rem',
                marginLeft:'-'+config.gutterLeft+'rem'
            }

            return (
                <div style={topHandleStyle}>

                </div>

            );
        }
        else return '';
    }

    const drawBottomHandle = ()=>
    {
        if(isOverCurrent && (stateQuadrant === 3 || stateQuadrant === 4))
        {

            const bottomHandleStyle = 
            {
                position:'absolute',
                height:remSize*config.gutterBottom+'px',
                width:'100%',
                backgroundColor:'#6097CE',
               // marginTop:'+'+config.gutterTop+'rem',
                marginLeft:'-'+config.gutterLeft+'rem'
            }

            return (
                <div style={bottomHandleStyle}>

                </div>

            );
        }
        else return '';
    }

    const handleAdd = ()=>{
        API.addChildren(idx);


    }
    const handleRemove = ()=>{
        API.deleteNode(idx);

        
    }

    const handleToggleVisibility =()=>
    {
       if(sons<=0)
        return;
       API.toggleVisibility(idx);

    }

    const isHoverDrop = ()=>
    {
        return (isOverCurrent && stateQuadrant === 5);
    }

    const getIcon = () =>
    {
        const res = card.icon?? ItemTypes[fileType].iconURL;
        
        return res;

    }

    const getHandleStyle =()=>
    {
         return {
        transform:expanded?"rotate(90deg)":"rotate(0deg)" , 
        transition: 'transform 150ms ease', // smooth transition
        }
    }

    const isFolder = () =>
    {
       return config.treeType ==="file" && fileType === ItemTypes.folder.id;
    }

    const renderAddButton = ()=>
    {
        if( config.treeType !=="file" || (config.treeType ==="file") && fileType === ItemTypes.folder.id)
        return(
            <button onClick={handleAdd} className="button add">+ Add child</button>
        )
        else return '';
    }

    const renderRemoveButton =()=>
    {
        return (<>
            <button onClick={handleRemove} className="button remove">x Remove element</button>
           </>
        );

    }

    const drawExpandedHandle = () =>
    {
        if(sons<=0)
        return(
            <p style={getHandleStyle()} className="handle"><span>&nbsp;</span></p>
        );
        else{
            return( <p style={getHandleStyle()} className="handle" onClick={handleToggleVisibility}><span>{'>'}</span></p>);
        }
    }

  return (
            <div className="card-container">
                <div className={"card"+ (isHoverDrop()?" hover-drop":"")} ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
                    {drawTopHandle()} 
                    
                    
                    <div className="inner">
                        {drawExpandedHandle()}
                        <img className={"icon "+ItemTypes[fileType].iconStyle} src={getIcon()}></img>
                        <p className={"text"}>{text}</p>
                            <br />
                            {renderAddButton()}
                            {renderRemoveButton()}
                    </div>
                    {drawBottomHandle()}
                
                </div>
            </div>);
    

   
};

export default Card;