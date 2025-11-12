import 'semantic-ui-css/semantic.min.css'
import Shelf from "../components/Shelf"
import { PlantData } from "../types"

const ShelfPage = (data:PlantData[]) => <Shelf data={data} itemsPerPage={10} />

export default ShelfPage
