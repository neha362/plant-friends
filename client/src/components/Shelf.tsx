import { Button } from "semantic-ui-react"
import { PlantData } from "../types";
import { useState, useMemo } from "react";
import Paginator from "./Paginator";


type ShelfProps = {
  data: PlantData[];
  itemsPerPage: number;
};

let lastPossiblePage = 1;
  

const Shelf = ({
  data,
  itemsPerPage,
}: ShelfProps) => {
const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsToDisplay: ShelfProps = useMemo(() => {
    data=data.filter(x => {return x.plant_name.toLowerCase().trim().includes(search.toLowerCase().trim())});
    console.log(data);
    lastPossiblePage = Math.ceil(data.length/itemsPerPage);
    return {data:data.slice((page - 1) * itemsPerPage, Math.min(data.length, (page) * itemsPerPage)), itemsPerPage:itemsPerPage};
  }, [data, search, page]);

  return (
    <div className="body">
      <h1>My Plants</h1>

      <input data-testid="search" defaultValue="search" id="search" type="text" value={search} onChange={(e) => {setPage(1); setSearch(e.target.value); console.log(e.target.value);}}/>

      <div className="garden">
        {itemsToDisplay.data.map((item) => (
          <div className="item" key={item.plant_name} data-testid="item">
            {item.plant_name} 
            {item.sent_from}
            {item.date.toDateString()}
          </div>
        ))}
      </div>
     <Paginator minLimit={1} maxLimit={Math.max(1, lastPossiblePage)} page={page} setPage={setPage}/>
    </div>
    
  );
}

export default Shelf
