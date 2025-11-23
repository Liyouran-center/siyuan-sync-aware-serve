// src/index.js

export default {
  async fetch(request, env, ctx) {
    const { DB } = env;
    const url = new URL(request.url);
    
    // 设置 CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, userkey, action',
    };

    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // 处理 GET 请求
    if (request.method === 'GET') {
      return new Response('感知节点正常运行中 (Cloudflare Workers + D1 数据库)', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          ...corsHeaders
        }
      });
    }

    // 处理 POST 请求
    if (request.method === 'POST' && url.pathname === '/') {
      try {
        const userKey = decodeURIComponent(request.headers.get('userkey') || '');
        const action = request.headers.get('action');
        const clientIp = request.headers.get('x-forwarded-for') || 
                        request.headers.get('cf-connecting-ip') || '';
        const userAgent = request.headers.get('user-agent') || '';

        if (!userKey || !action) {
          return new Response(
            JSON.stringify({ message: 'Missing userkey or action header' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        }

        const requestBody = await request.json();

        if (action === 'push') {
          if (typeof requestBody.syncst !== 'number') {
            return new Response(
              JSON.stringify({ message: 'Invalid syncst value' }),
              {
                status: 400,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders
                }
              }
            );
          }

          // 使用 INSERT OR REPLACE 来更新或插入数据
          const result = await DB.prepare(`
            INSERT OR REPLACE INTO user_data (userKey, syncst, ip, userAgent, timestamp)
            VALUES (?, ?, ?, ?, ?)
          `).bind(
            userKey, 
            requestBody.syncst, 
            clientIp, 
            userAgent, 
            Math.floor(Date.now() / 1000)  // 使用 UNIX 时间戳
          ).run();

          return new Response(
            JSON.stringify({ 
              message: 'Data received and written successfully',
              success: true 
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );

        } else if (action === 'pull') {
          // 查询用户数据
          const result = await DB.prepare(`
            SELECT * FROM user_data WHERE userKey = ?
          `).bind(userKey).first();

          if (!result) {
            // 用户数据不存在
            return new Response(
              JSON.stringify({ 
                userKey, 
                syncst: 0,
                exists: false
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders
                }
              }
            );
          }

          // 检查 IP 和 User-Agent 是否匹配
          if (result.ip === clientIp && result.userAgent === userAgent) {
            // 条件匹配，删除数据并返回 syncst = 0
            await DB.prepare(`
              DELETE FROM user_data WHERE userKey = ?
            `).bind(userKey).run();

            return new Response(
              JSON.stringify({ 
                userKey, 
                syncst: 0,
                deleted: true
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders
                }
              }
            );
          } else {
            // 条件不匹配，返回存储的 syncst
            return new Response(
              JSON.stringify({ 
                userKey, 
                syncst: result.syncst,
                exists: true
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders
                }
              }
            );
          }
        } else {
          return new Response(
            JSON.stringify({ message: 'Invalid action' }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        }

      } catch (error) {
        console.error('Error processing request:', error);
        
        return new Response(
          JSON.stringify({ 
            message: 'Error processing request',
            error: error.message 
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }
    }

    // 404 处理
    return new Response(
      JSON.stringify({ message: 'Not Found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
};
