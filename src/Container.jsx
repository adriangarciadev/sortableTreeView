import { useState, useRef, useCallback } from 'react';
import produce from "immer"
import renderLeaf from './renderLeaf';
import { ItemTypes } from './ItemTypes';

const style = {
    //width: 400,
};

let Controls = ()=>{}

//example tree:
/*so called pure function processes the data creating a copy with meta data used in fast searches the idea*/
/*is to maintain the data available at all times to be retrievable so it keeps the original data organized in a tree structure, as it comes*/



export const Preprocess = ({tree,name, options, callback})=>
{
    let config = {

        mode:options.mode ?? "hover",
        gutterTop:   options.gutterTop ?? 0.5, 
        gutterBottom: options.gutterBottom ?? 0.5, 
        gutterLeft: options.gutterLeft ?? 1.0, 
        quadrantSize:options.quadrantSize ?? 1.0,
        treeType: options.treeType ?? "file", 
    }

    //launches walkTree.
    const preProcessData =(newData)=>
    {
         
         newData.tree = tree;

         walkTree(tree, newData, "")

     

    }


    /*walk the tree recursively to create indexes and other artifacts to search the iteams fast*/
    const walkTree = (tree, newData, parent)=>
    {
    
        for(let i=0;i<tree.children.length;i++)
         {
             let subtree = tree.children[i];
             let parentID =name + subtree.id; 
             newData.fast[parentID] = {lastUpdate : 0 , visible: subtree.visible?? true, parent:parent, index:i};
             if(config.treeType==="file"){
                
                newData.fast[parentID].fileType = subtree.fileType ?? ItemTypes.folder.id;

             }
             walkTree(subtree, newData, parentID);

         }

    }

    //data skeleton
    let newData ={treename:name, fast:{}, lastID:8};
    
    //data gets processed in this function.
    preProcessData(newData);
    
    return (<Container data={newData} config={config} callback={callback}/>)
}

//the idea with this representation is avoiding to re-render whole subtrees that are untouched, sometimes these have stale references
//that's why we are using useRef here, to avoid that case.
//fast is an index of sorts to keep track of where the nodes are on the tree, it should be a trie or such data structure to avoid having to walk 
//each property on every change

const Container = ({data, config,callback}) => {
    {
    
       const [state, setState] = useState(data);
       const stateRef = useRef(state); 
        
       if(callback)
       {
           callback.current.getData = ()=>
           {
               return stateRef.current.tree;
           }
       }
       
       Controls = () =>
       {
           return state.tree;
       }

       //USE REF TO AVOID STALE CALLBACKS
       const updateState = function(newState)
       {
            stateRef.current = newState;
            setState(newState);
       }

        /*******GENERAL USE FUNCTIONS****/
       /********************************/
      /**********************************************************
       * get ID data
       * @param {number} id - the numeric id of the current Node 
       * @returns {String} the internal ID of the node (treename concat id)
       */
       
      const getID= (id, from = stateRef.current) =>
       {
           return  from.treename+id;
       }

       const getNodeIndex = (id, from = stateRef.current) =>
       {
        return from.fast[id].index

       }

       
        /*******GENERAL USE FUNCTIONS****/
       /**************************/
       /****GET FAST DATA****/
       const getFastData = (id, from = stateRef.current)=>{
            return from.fast[getID(id)];
       }

       /*******GENERAL USE FUNCTIONS****/
       /**************************/
       /****GET TIME STAMP****/
       const getTimeStamp = (id, from = stateRef.current) =>
       {
            return from.fast[getID(id)].lastUpdate;
       }

       const getFileType = (id, from = stateRef.current) =>
       {
            return from.fast[getID(id)].fileType;
       }
       
         /*******GENERAL USE FUNCTIONS****/
        /********************************/
       /**********GET Path**************/
       const getPath = function(ID, from = stateRef.current)
       {
            let path = [from.fast[ID].index];
            let search =from.fast[ID];

            while(search.parent !=="")
            {
                
                search = from.fast[search.parent];
                path.push(search.index);

            }
            return path;
            
       }

         /*******GENERAL USE FUNCTIONS****/
        /**************************/
       /****Follow Path****/
       const followPath = ((draft, depth, path) =>{

            let route = draft.tree;
            for(let i=path.length-1; i>-1+depth;i--)
            {
                route = route.children[path[i]];
            }
            return route;


        });


        /*******GENERAL USE FUNCTIONS****/
       /**************************/
       /****traverse tree****/
       /*traverse draft tree to collect all the ids to of elements to remove***/
       /*works on draft object tree leaf*/
       /*traverse draft tree and get all the ids*/

       const traverseAndRemoveFromFast = (draft, parentNode)=>{

            //delete from fast
            let id = parentNode.id;
           
            delete draft.fast[getID(id)];
           
            for(let subtree of parentNode.children)
            {
                traverseAndRemoveFromFast(draft, subtree);
            }
            


    }
        
       /*******GENERAL USE FUNCTIONS****/
       /**************************/
       /**update siblings*/

       const updateSiblings =(draft, parentNode, index, delta)=>
       {

        //TODO
        let i = Math.max(index,0);
        for(let i=index;i<parentNode.children.length;i++)
        {

            draft.fast[getID(parentNode.children[i].id)].index+=delta; 

        }

       }



       /*******GENERAL USE FUNCTIONS****/
       /**************************/
       /****Remove leaf****/
       /*Removes a leaf from path also affects the fast object changing the index of the subsequent leaves***/
       /*works on draft object tree leaf*/
       /*Remove for deleting entry of fast if only moving it remove should be false*/

        const removeNode = (draft, parentNode, index, remove = true)=>{


            if(remove)
            {
                traverseAndRemoveFromFast(draft, parentNode.children[index]);
            }

            parentNode.children.splice(index,1);
            
            updateSiblings(draft, parentNode, index, -1);

        }

        const addNode= (draft, parentNode, childNode, index)=>
        {

            
    
            parentNode.children.splice(index, 0, childNode);

            updateSiblings(draft, parentNode,index+1, 1);

            //finally 
            draft.fast[getID(childNode.id,draft)].index = index;

            draft.fast[getID(childNode.id,draft)].parent = parentNode.isRoot?"":getID(parentNode.id,draft);

            


        }
        const pushNode = (draft, parentNode, childNode) =>
        {
            let index = parentNode.children.length;
            parentNode.children.push(childNode);
            draft.fast[getID(childNode.id,draft)].index = index;
            draft.fast[getID(childNode.id,draft)].parent = parentNode.isRoot?"":getID(parentNode.id,draft);
           
   
        }

        /**************ANCESTRY FUNCTIONS****************/
        const getNodeRelationship = (dragRoute, hoverRoute) =>
        {
            let ans = {
                isSibling:false,
                isAncestor: false,
                isSon:false,
                isBefore:false,
                isExactlyBefore:false,
                isExactlyAfter:false,
            }

            let DL = dragRoute.length;
            let HL = hoverRoute.length;
            let smaller = Math.min(DL, HL);
            let coincidence = 0;

            for(let i = 0; i<smaller;i++)
            {
                if(dragRoute[DL-i-1] == hoverRoute[HL-i-1])
                {
                    coincidence++;

                }
                else
                {
                    break;
                }
            }

            if(coincidence === smaller)
            {
                [ans.isAncestor, ans.isSon]=[smaller === DL, smaller === HL ];

            }

            if((HL===DL) && coincidence === (smaller-1)  )
            {
                let diff = dragRoute[0] - hoverRoute[0];
               
                [ans.isSibling, ans.isBefore, ans.isExactlyBefore, ans.isExactlyAfter  ] = [true,  diff<0, diff ===-1, diff===1 ];
                

            }
            
            return ans;


        }


       /*******STATE AFFECTING FUNCTIONS*******/
       /**************************/
       /****Delete Children****/

       const deleteNode = useCallback(childID =>{
      
        let path = getPath(childID);

        const nextState = produce(stateRef.current, draft => {

            let route = followPath(draft, 1, path);

            let currIndex = getNodeIndex(childID, draft);

            removeNode(draft, route, currIndex, true);

            
        });

        updateState(nextState);




       },[]);

                    
       /*******STATE AFFECTING FUNCTIONS*******/
       /**************************/
       /****swap nodes****/


       const swapNodes = useCallback((dragID, hoverID, mode) => {

        
      
        let pathD = getPath(dragID);
        let pathH = getPath(hoverID);
 
        const nextState = produce(stateRef.current, draft => {

      
            let routeD = followPath(draft, 1, pathD);

            let routeH = mode!=5?followPath(draft, 1, pathH) : followPath(draft, 0, pathH);


            let dragIndex = getNodeIndex(dragID, draft);
         
            let tempNode = routeD.children[dragIndex];

           //console.log("the current index from swapNodes: "+ dragIndex +" the current ID :" +dragID +" the object : " +JSON.stringify(draft) )
        
            let hoverIndex = getNodeIndex(hoverID);

            removeNode(draft, routeD,dragIndex, false);
           
            //0 comes from the top is moved to the top side of hover
            //1 comes from the bottom is moved to the top side of hover
            switch(mode)
            {
                case 0:addNode(draft, routeH, tempNode,   hoverIndex);break;
                case 1:addNode(draft, routeH, tempNode,   hoverIndex+1);break;
                case 5:pushNode(draft, routeH, tempNode);break;

            }

 
        })

        updateState(nextState);


        });

        const tryToSwapNodes = useCallback((dragID, hoverID, quadrant) =>
        {
             let pathD = getPath(dragID);
            let pathH = getPath(hoverID);
           
            let rel = getNodeRelationship(pathD, pathH);


            if(rel.isAncestor)
            {
                return;
            }

            switch(quadrant)
            {
                case 0:break;
                
                case 1: //1 or 2
                case 2:
                    if(rel.isBefore)
                    {
                        !rel.isExactlyBefore && swapNodes(dragID, hoverID, 0);
                    }
                    else
                    {
                        swapNodes(dragID, hoverID, 0);
                      
                    }
                    
                    break;
                case 3: // 3 or 4
                case 4:
                    if(rel.isExactlyAfter)
                            break;

                    if(rel.isExactlyBefore){   
                        swapNodes(dragID, hoverID, 0);
                    }
                    else{
                        swapNodes(dragID, hoverID, 1);
                    }
                    
                    break;
                case 5://five is center
                    swapNodes(dragID, hoverID, 5);
                    break;


            }


       
        })


       /*******STATE AFFECTING FUNCTIONS*******/
       /**************************/
       /****add Children****/

       const addChildren = useCallback((parentID) => {


            let path = getPath(parentID);
     
            const nextState = produce(stateRef.current, draft => {

            
                //Increase counter                
                draft.lastID++;    

                //find index with route.
                
                let route = followPath(draft, 0, path);

                //create entry at node fast search
                draft.fast[draft.treename+draft.lastID] ={ visible:true, parent:parentID, index: route.children.length}
                //file system
                if(config.treeType==="file"){
                    
                    draft.fast[draft.treename+draft.lastID].fileType = ItemTypes.folder.id;

                }
                    

                let treePush = {name:"new folder"+draft.lastID, text:"new folder "+draft.lastID, id:draft.lastID, children:[]};
                route.children.push(treePush)
                
   
            })

            updateState(nextState);
            





      }, []);

      const toggleVisibility =  useCallback((nodeID)=>{

        let path = getPath(nodeID);

        const nextState = produce(stateRef.current, draft => {

            let route = followPath(draft, 0, path);

            console.log(JSON.stringify(draft.fast));
            console.log("THE ID: " + getID(nodeID,draft));

            draft.fast[nodeID].visible = !(draft.fast[nodeID].visible); 

           //hack to repaint the tree without really adding data to the tree model:
           /**/
           /**/let hackAttribute = getID(nodeID,draft)+"xxxr";
           /**/ 
           /**/route[hackAttribute]=0;
           /**/
           /**/delete route[hackAttribute];
           /**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**//**/ 

        });

        updateState(nextState);

      },[]);
    



       const API =
       {
        getID:getID,
        getFastData:getFastData,
        getTimeStamp:getTimeStamp,
        addChildren:addChildren,
        deleteNode:deleteNode,
        tryToSwapNodes:tryToSwapNodes,
        toggleVisibility:toggleVisibility,
        getFileType:getFileType,

       }
       



 

        return (<>
               <div className="treeview" style={style}>{state.tree.children.map((card, i) => renderLeaf(card, i, API, config))}</div>
			</>);
    }
};


export {Controls}