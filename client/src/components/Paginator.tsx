import { ChevronUpCircle, ChevronDownCircle } from "lucide-react";

type Props = {
  minLimit?: number;
  maxLimit: number;
  page: number;
  setPage: (page: number) => void;
};

const Paginator = ({ minLimit, maxLimit, page, setPage }: Props) => {
  const ascChangePage = () => {
    if (page < maxLimit)
      setPage(page + 1);
  };

  const decChangePage = () => {
    if (page > ((minLimit != undefined && minLimit != null) ? minLimit : 0))
      setPage(page - 1);
  };

	// TODO 1: Add reactive logic to make the two buttons update the setPage.
  return (

    <div className="row">
      <button data-testid="decrementpage" onClick={decChangePage}>
        <ChevronDownCircle size={64} />
      </button>
      <h2 data-testid="pagenumber" className="pagenumber">
        {page}
      </h2>
      <button data-testid="incrementpage" onClick={ascChangePage}>
        <ChevronUpCircle size={64} />
      </button>
    </div>
  );
};

export default Paginator;
