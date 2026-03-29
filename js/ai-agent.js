/* =============================================
   CAREFLOW IIoT — AI AGENT
   ============================================= */

const aiHistory = [{
    role: 'assistant',
    content: 'Hello! I\'m your CareFlow AI Agent. I have full visibility into your multi-generator system. How can I help you optimize operations today?'
}];

async function sendAI() {
    const input = document.getElementById('ai-input');
    const msgText = input.value.trim();
    if (!msgText) return;
    input.value = '';

    const msgsDiv = document.getElementById('ai-msgs');

    // Add user message
    const userEl = document.createElement('div');
    userEl.className = 'msg user';
    userEl.textContent = msgText;
    msgsDiv.appendChild(userEl);

    // Add thinking indicator
    const thinkEl = document.createElement('div');
    thinkEl.className = 'msg ai thinking';
    thinkEl.textContent = 'Analyzing system data...';
    msgsDiv.appendChild(thinkEl);
    msgsDiv.scrollTop = msgsDiv.scrollHeight;

    aiHistory.push({ role: 'user', content: msgText });

    const gen1 = generators[0];
    const gen2 = generators[1];

    // Simulate AI response based on context
    setTimeout(() => {
        let reply = '';
        const lower = msgText.toLowerCase();

        if (lower.includes('power') || lower.includes('energy')) {
            reply = `Current total power: ${getTotalPower().toFixed(1)}kW across ${generators.filter(g => g.status === 'online').length} active generators. ` +
                `GEN-01: ${gen1.ptotal.toFixed(1)}kW, GEN-02: ${gen2.ptotal.toFixed(1)}kW. ` +
                `30-day avg consumption: ${Math.round(powerHistory30.reduce((s, d) => s + d.usage, 0) / 30)}kWh/day. ` +
                `I recommend load balancing if GEN-03 is brought online.`;
        } else if (lower.includes('bearing') || lower.includes('maintenance')) {
            reply = `⚠ CRITICAL: GEN-01 bearing RUL < 72h (health: ${gen1.health.bearings}%). ` +
                `Recommend immediate scheduling. GEN-02 bearings at ${gen2.health.bearings}% — within safe range. ` +
                `Oil & filter change due in 32h on GEN-01. Assign TECH-01 for priority maintenance.`;
        } else if (lower.includes('thd') || lower.includes('harmonic')) {
            reply = `THD voltage on GEN-01 L3: ${gen1.thd.toFixed(1)}% (limit: 5%). ` +
                `Trending upward — harmonic filter inspection recommended. ` +
                `GEN-02 THD: ${gen2.thd.toFixed(1)}% — nominal. ` +
                `Consider installing active harmonic filter on L3 feeder.`;
        } else if (lower.includes('distributor') || lower.includes('panel')) {
            reply = `Distribution status: ` +
                `DIST-01 (Main): ${distributors[0].loadPercent}% load, ${distributors[0].voltage.toFixed(1)}V. ` +
                `DIST-02 (Workshop): ${distributors[1].loadPercent}% load. ` +
                `DIST-03 (Office): ${distributors[2].loadPercent}% load. All breakers nominal.`;
        } else if (lower.includes('generator') || lower.includes('gen')) {
            reply = `Generator fleet: GEN-01 (${gen1.status}) ${gen1.ptotal.toFixed(1)}kW PF:${gen1.pf.toFixed(2)}, ` +
                `GEN-02 (${gen2.status}) ${gen2.ptotal.toFixed(1)}kW PF:${gen2.pf.toFixed(2)}, ` +
                `GEN-03 (standby) — ready for peak demand. Total run hours: ${generators.reduce((s, g) => s + g.runHours, 0)}h.`;
        } else if (lower.includes('pf') || lower.includes('power factor')) {
            reply = `Average PF: ${getAvgPF()}. GEN-01 PF: ${gen1.pf.toFixed(2)}, GEN-02 PF: ${gen2.pf.toFixed(2)}. ` +
                `PF below 0.85 triggers capacitor bank compensation. ` +
                `Current reactive power: ${(gen1.qtotal + gen2.qtotal).toFixed(1)}kVAr total.`;
        } else {
            reply = `System overview: ${generators.filter(g => g.status === 'online').length}/3 generators online, ` +
                `total power ${getTotalPower().toFixed(1)}kW, avg PF ${getAvgPF()}, ` +
                `health score ${getAvgHealth()}%. ` +
                `Try asking about power, generators, distributors, maintenance, THD, or power factor.`;
        }

        aiHistory.push({ role: 'assistant', content: reply });
        thinkEl.className = 'msg ai';
        thinkEl.textContent = reply;
        msgsDiv.scrollTop = msgsDiv.scrollHeight;
    }, 1200);
}
