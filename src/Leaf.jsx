import React from 'react';
import './Treeview.css'; // Tell webpack that Button.js uses these styles
import { renderCard } from './renderCard';
import renderLeaf from './renderLeaf'





const Leaf = ({idx, id, card, text, index, moveCard,  children, parent, expanded, timestamp, API, config}) =>
{



  return (
            <div className="leaf">
                <div>
                   {renderCard(card, index, API, config, expanded, children.length)}
                </div>

               
                {children&&expanded?(
                    <div>
                        {children.map((cardc,i) => renderLeaf(cardc, i,API, config))}
                    </div>)
                :null}

            </div>);
    

}




  const comparisonFn = function (prevProps, nextProps) {


       /* console.log("the ID "+prevProps.idx)
        console.log("prev TimeStamp "+prevProps.timeStamp)
        console.log("next TimeStamp "+nextProps.timeStamp) 
        console.log("prev children "+JSON.stringify(prevProps.children))
        console.log("next children "+JSON.stringify(nextProps.children))
       
        console.log(prevProps.timeStamp === nextProps.timeStamp?"yes it's equal":"no it's not equal");
        */
        //console.log("prev props: " +JSON.stringify(prevProps) +" next props : " + JSON.stringify(nextProps ))
        //console.log("type of : " +(typeof (prevProps.timestamp)) +" values again prev: " +prevProps.timeStamp +" next props : " + nextProps.timeStamp + " idx : " + nextProps.idx +" test:  prevT === nextT "+ (prevProps.timestamp === nextProps.timestamp))
        return (prevProps.card === nextProps.card);
  };

export default React.memo(Leaf, comparisonFn);