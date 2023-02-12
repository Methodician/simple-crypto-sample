import Big from 'big.js';
import { MatchMessage } from '../models/types/message.models';
import { RestResponseTrade, SLTrade } from '../models/types/trade.models';

// note the typing needs work. This will let undefined productId through.
const processTrade = (
  match: MatchMessage | RestResponseTrade,
  productId: string
): SLTrade => ({
  price: Big(match.price),
  size: Big(match.size),
  date: new Date(match.time),
  side: match.side,
  tradeId: match.trade_id,
  productId: productId,
});

export default processTrade;
