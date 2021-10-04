import Card from "./Card";


export function renderCard (card, i, API, config, expanded, numSiblings)  {
    return (<Card idx={API.getID(card.id)} card={card} key={card.id} index={i} id={card.id} text={card.text} children={card.children} API={API}  timeStamp ={API.getTimeStamp(card.id)}  fileType={API.getFileType(card.id)} config={config} expanded={expanded} sons={numSiblings}/>);
};

