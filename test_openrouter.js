async function test() {
  const token = process.env.OPENROUTER_API_KEY;
  if (!token) return console.log('NO OPENROUTER KEY');
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'qwen/qwen-2.5-72b-instruct:free',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 10
    })
  });
  
  console.log(response.status, await response.text());
}
test();
