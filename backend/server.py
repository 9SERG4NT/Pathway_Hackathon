from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import asyncio
import random
import json
from collections import deque

# Simulated Pathway-style streaming data processor
class StreamProcessor:
    def __init__(self):
        self.stock_data = deque(maxlen=100)
        self.alerts = []
        self.running = False
        
    async def generate_market_data(self):
        """Simulate real-time market data stream"""
        stocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM']
        base_prices = {'AAPL': 180, 'GOOGL': 140, 'MSFT': 380, 'AMZN': 170, 
                      'TSLA': 250, 'META': 480, 'NVDA': 880, 'JPM': 160}
        
        while self.running:
            for symbol in stocks:
                price = base_prices[symbol] * (1 + random.uniform(-0.02, 0.02))
                volume = random.randint(1000000, 5000000)
                
                data_point = {
                    'symbol': symbol,
                    'price': round(price, 2),
                    'volume': volume,
                    'timestamp': datetime.now(timezone.utc).isoformat(),
                    'change': round(random.uniform(-2, 2), 2)
                }
                
                self.stock_data.append(data_point)
                
                # Anomaly detection
                if abs(data_point['change']) > 1.5:
                    self.alerts.append({
                        'id': str(uuid.uuid4()),
                        'type': 'price_alert',
                        'symbol': symbol,
                        'message': f"{symbol} showing unusual movement: {data_point['change']}%",
                        'timestamp': data_point['timestamp'],
                        'severity': 'high' if abs(data_point['change']) > 1.8 else 'medium'
                    })
                    
            await asyncio.sleep(2)
    
    def get_latest_data(self, limit=20):
        return list(self.stock_data)[-limit:]
    
    def get_alerts(self, limit=10):
        return self.alerts[-limit:]
    
    def get_aggregates(self):
        if not self.stock_data:
            return {}
        
        symbols = {}
        for item in self.stock_data:
            sym = item['symbol']
            if sym not in symbols:
                symbols[sym] = []
            symbols[sym].append(item['price'])
        
        aggregates = {}
        for sym, prices in symbols.items():
            if prices:
                aggregates[sym] = {
                    'current': prices[-1],
                    'avg': round(sum(prices) / len(prices), 2),
                    'min': min(prices),
                    'max': max(prices),
                    'volume': random.randint(50000000, 200000000)
                }
        
        return aggregates

# LLM Integration for RAG
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("Warning: emergentintegrations not available, LLM features disabled")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'pathway_finance_db')]

# Create the main app
app = FastAPI(title="Pathway Financial Intelligence Platform")
api_router = APIRouter(prefix="/api")

# Stream processor instance
stream_processor = StreamProcessor()

# Models
class QueryRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

class QueryResponse(BaseModel):
    answer: str
    sources: List[str] = []
    timestamp: str

class Document(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    category: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DocumentCreate(BaseModel):
    title: str
    content: str
    category: str

# Financial knowledge base
FINANCIAL_DOCS = [
    {
        "title": "Market Volatility Analysis",
        "content": "Market volatility refers to the rate at which stock prices increase or decrease. High volatility indicates larger price swings and higher risk. The VIX index measures market volatility and is often called the 'fear index'. During periods of high volatility, investors should consider diversification and risk management strategies.",
        "category": "market_analysis"
    },
    {
        "title": "Technical Indicators Guide",
        "content": "Moving averages smooth out price data to identify trends. The 50-day and 200-day moving averages are commonly used. When the 50-day crosses above the 200-day (golden cross), it's a bullish signal. Volume indicates trading activity and confirms price movements. High volume on price increases suggests strong buying pressure.",
        "category": "technical_analysis"
    },
    {
        "title": "Risk Management Principles",
        "content": "Effective risk management involves portfolio diversification, position sizing, and stop-loss orders. Never risk more than 2% of your portfolio on a single trade. Diversification across sectors and asset classes reduces overall risk. Regular portfolio rebalancing maintains target allocations.",
        "category": "risk_management"
    },
    {
        "title": "Real-Time Trading Strategies",
        "content": "Real-time data enables algorithmic trading and immediate response to market events. High-frequency trading relies on sub-second execution. Event-driven strategies react to news and earnings announcements. Momentum strategies capitalize on trending stocks with strong volume.",
        "category": "trading_strategies"
    },
    {
        "title": "Anomaly Detection in Markets",
        "content": "Unusual price movements can signal opportunities or risks. Spike in volume without price change may indicate accumulation. Sudden gaps often occur after earnings or major news. Price divergence from moving averages suggests potential reversals. Machine learning models can identify complex patterns in real-time data streams.",
        "category": "anomaly_detection"
    }
]

@api_router.get("/")
async def root():
    return {"message": "Pathway Financial Intelligence Platform", "status": "active"}

@api_router.get("/stream/data")
async def get_stream_data():
    """Get latest streaming market data"""
    return {
        "data": stream_processor.get_latest_data(20),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/stream/aggregates")
async def get_aggregates():
    """Get aggregated market statistics"""
    return {
        "aggregates": stream_processor.get_aggregates(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/stream/alerts")
async def get_alerts():
    """Get real-time alerts and anomalies"""
    return {
        "alerts": stream_processor.get_alerts(10),
        "count": len(stream_processor.alerts),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@api_router.post("/query", response_model=QueryResponse)
async def query_rag(query: QueryRequest):
    """RAG-powered financial query endpoint"""
    try:
        if not LLM_AVAILABLE:
            # Fallback response without LLM
            relevant_docs = [doc['title'] for doc in FINANCIAL_DOCS[:2]]
            return QueryResponse(
                answer="LLM integration not available. Please ensure emergentintegrations is installed. Based on available documents, check the market analysis and technical indicators sections.",
                sources=relevant_docs,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        
        # Get API key
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(400, "EMERGENT_LLM_KEY not configured")
        
        # Build context from documents
        context = "\n\n".join([f"Document: {doc['title']}\n{doc['content']}" for doc in FINANCIAL_DOCS])
        
        # Add real-time data context
        aggregates = stream_processor.get_aggregates()
        recent_alerts = stream_processor.get_alerts(5)
        
        realtime_context = f"\n\nCurrent Market Data:\n"
        for symbol, data in list(aggregates.items())[:5]:
            realtime_context += f"{symbol}: ${data['current']} (Avg: ${data['avg']})\n"
        
        if recent_alerts:
            realtime_context += "\nRecent Alerts:\n"
            for alert in recent_alerts:
                realtime_context += f"- {alert['message']}\n"
        
        # Create LLM chat instance
        session_id = query.session_id or str(uuid.uuid4())
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="You are a financial analyst assistant with access to real-time market data and financial knowledge. Provide accurate, helpful analysis based on the provided context and data."
        ).with_model("openai", "gpt-4o-mini")
        
        # Send query with context
        user_message = UserMessage(
            text=f"Context:\n{context}\n{realtime_context}\n\nQuestion: {query.question}\n\nProvide a concise, helpful answer based on the context and real-time data."
        )
        
        response = await chat.send_message(user_message)
        
        # Extract sources
        sources = [doc['title'] for doc in FINANCIAL_DOCS[:3]]
        
        return QueryResponse(
            answer=response,
            sources=sources,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        
    except Exception as e:
        logging.error(f"Query error: {str(e)}")
        raise HTTPException(500, f"Query processing failed: {str(e)}")

@api_router.get("/documents", response_model=List[Document])
async def get_documents():
    """Get indexed documents"""
    docs = []
    for doc_data in FINANCIAL_DOCS:
        doc = Document(
            title=doc_data['title'],
            content=doc_data['content'],
            category=doc_data['category']
        )
        docs.append(doc)
    return docs

@api_router.post("/documents", response_model=Document)
async def add_document(doc_create: DocumentCreate):
    """Add new document to knowledge base"""
    doc = Document(
        title=doc_create.title,
        content=doc_create.content,
        category=doc_create.category
    )
    
    # Store in MongoDB
    doc_dict = doc.model_dump()
    await db.documents.insert_one(doc_dict)
    
    # Add to in-memory store
    FINANCIAL_DOCS.append({
        'title': doc.title,
        'content': doc.content,
        'category': doc.category
    })
    
    return doc

@api_router.get("/stats")
async def get_stats():
    """Get platform statistics"""
    return {
        "total_documents": len(FINANCIAL_DOCS),
        "streaming_active": stream_processor.running,
        "data_points": len(stream_processor.stock_data),
        "total_alerts": len(stream_processor.alerts),
        "llm_available": LLM_AVAILABLE
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    logging.info("Starting Pathway Financial Intelligence Platform")
    stream_processor.running = True
    asyncio.create_task(stream_processor.generate_market_data())
    logging.info("Real-time data stream initiated")

@app.on_event("shutdown")
async def shutdown_event():
    stream_processor.running = False
    client.close()
    logging.info("Shutdown complete")

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)