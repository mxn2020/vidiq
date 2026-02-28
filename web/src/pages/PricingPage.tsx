import { Check } from 'lucide-react'

function PricingPage() {
    return (
        <div>
            <div className="text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
                <h1>Simple, Transparent Pricing</h1>
                <p className="text-secondary" style={{ fontSize: '1.1rem', marginTop: 'var(--space-md)' }}>
                    Start free. Upgrade when you need more power.
                </p>
            </div>

            <div className="pricing-grid">
                {/* Free */}
                <div className="pricing-card">
                    <div className="pricing-name">Free</div>
                    <div className="pricing-price">$0 <span>/month</span></div>
                    <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        Perfect for trying out VidIQ
                    </p>
                    <ul className="pricing-features">
                        <li><Check size={14} /> 3 analyses per day</li>
                        <li><Check size={14} /> Videos up to 30 seconds</li>
                        <li><Check size={14} /> Scene timeline output</li>
                        <li><Check size={14} /> Copy & download results</li>
                        <li><Check size={14} /> 7-day analysis history</li>
                    </ul>
                    <button className="btn btn-secondary w-full" id="free-plan-btn">Get Started</button>
                </div>

                {/* Premium */}
                <div className="pricing-card featured">
                    <div className="pricing-badge">Most Popular</div>
                    <div className="pricing-name">Unlimited Vision</div>
                    <div className="pricing-price">$4.99 <span>/month</span></div>
                    <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        For power users and content creators
                    </p>
                    <ul className="pricing-features">
                        <li><Check size={14} /> Unlimited analyses</li>
                        <li><Check size={14} /> Videos up to 10 minutes</li>
                        <li><Check size={14} /> Custom prompts</li>
                        <li><Check size={14} /> Multi-model comparison</li>
                        <li><Check size={14} /> Export as PDF / SRT / JSON</li>
                        <li><Check size={14} /> Unlimited history</li>
                        <li><Check size={14} /> Priority processing</li>
                        <li><Check size={14} /> Ad-free experience</li>
                    </ul>
                    <button className="btn btn-primary w-full" id="premium-plan-btn">Upgrade Now</button>
                </div>

                {/* API */}
                <div className="pricing-card">
                    <div className="pricing-name">Developer API</div>
                    <div className="pricing-price">$29 <span>/month</span></div>
                    <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        Build video intelligence into your products
                    </p>
                    <ul className="pricing-features">
                        <li><Check size={14} /> 100 API calls / month</li>
                        <li><Check size={14} /> All models available</li>
                        <li><Check size={14} /> Webhook notifications</li>
                        <li><Check size={14} /> JSON structured output</li>
                        <li><Check size={14} /> Dedicated support</li>
                    </ul>
                    <button className="btn btn-secondary w-full" id="api-plan-btn">Contact Sales</button>
                </div>
            </div>
        </div>
    )
}

export default PricingPage
