import Leaf from "./Leaf";

const renderLeaf = (card, index, API, config) =>
{
    return (<Leaf idx={API.getID(card.id)} card={card} key={card.id} index={index} id={card.id} text={card.text} children={card.children} API={API} expanded={API.getFastData(card.id).visible} timeStamp ={API.getTimeStamp(card.id)} config={config}/>);
}

export default renderLeaf;