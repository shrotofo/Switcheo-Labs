// Computational inefficiency and anti patterns : 
1. State Initialization within useEffect
Problem : The Datasource instance created inside useEffect can lead to unnecessary re-rendering.
Solution: Can use useRef to store the instance and initialize Datasource outside the component.

2. Incorrect Use of console.err
Problem: console.err is incorrect and won't log errors properly.
Solution: Can use console.error to correctly log errors.

3. Priority Calculation and Filter Logic
Problem: The filter logic in useMemo has redundant checks and uses an undefined variable.
Solution:  Can simplify the filter logic and use correct variable names.

4. Unnecessary Mapping and Sorting Inside useMemo
Problem: Mapping and sorting in useMemo can be simplified and optimized.
Solution:  Can combine filter and sort logic more effectively.

5. Unnecessary Mapping for Formatted Balances
Problem: The formattedBalances variable is created but never used, adding unnecessary computation.
Solution:  Can integrate formatting directly within the rows mapping.

6. Type Mismatch in sortedBalances
Problem: The getPriority function expects a blockchain property, but WalletBalance doesn't have it.
Solution: can ensure WalletBalance includes all necessary properties like blockchain.

//Corrected React Code

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;  // Added the 'blockchain' property to ensure proper functioning of the 'getPriority' function
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

class Datasource {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  async getPrices(): Promise<{ [key: string]: number }> {
    const response = await fetch(this.url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const [prices, setPrices] = useState<{ [key: string]: number }>({});

  // Use useRef to store the Datasource instance
  const datasourceRef = useRef<Datasource | null>(null);

  useEffect(() => {
    if (!datasourceRef.current) {
      datasourceRef.current = new Datasource("https://interview.switcheo.com/prices.json");
    }
    const datasource = datasourceRef.current;
    datasource.getPrices()
      .then(prices => setPrices(prices)) 
      .catch(console.error);  // Corrected 'console.err' to 'console.error'
  }, []);

  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case 'Osmosis': return 100;
      case 'Ethereum': return 50;
      case 'Arbitrum': return 30;
      case 'Zilliqa':
      case 'Neo': return 20;
      default: return -99;
    }
  }

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance) => getPriority(balance.blockchain) > -99 && balance.amount > 0)  // Optimized filtering logic
      .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain));  // Optimized sorting logic
  }, [balances, prices]);  // Added prices to the dependency array

  const rows = sortedBalances.map((balance, index) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.amount.toFixed()}  // Integrated formatted amount directly
      />
    );
  });

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};


