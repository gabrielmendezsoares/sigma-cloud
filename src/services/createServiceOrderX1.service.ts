import { NextFunction, Request, Response } from 'express';
import { HttpClientUtil, BasicAndBearerStrategy } from '../../expressium/src/index.js';
import { IReqBody, IResponse, IResponseData } from '../interfaces/index.js';

export const createServiceOrderX1 = async (
  req: Request, 
  _res: Response, 
  _next: NextFunction, 
  timestamp: string
): Promise<IResponse.IResponse<IResponseData.ICreateServiceOrderX1ResponseData | IResponseData.IResponseData>> => {
  const {
    data: {
      data_json: {
        cs_id,
        descricao_problema
      }
    }
  } = req.body as IReqBody.ICreateServiceOrderX1ReqBody;
  
  const httpClientInstance = new HttpClientUtil.HttpClient();

  httpClientInstance.setAuthenticationStrategy(
    new BasicAndBearerStrategy.BasicAndBearerStrategy(
      'post', 
      'https://cloud.segware.com.br/server/v2/auth', 
      process.env.SIGMA_CLOUD_USERNAME as string, 
      process.env.SIGMA_CLOUD_PASSWORD as string, 
      { type: "WEB" }, 
      (response: Axios.AxiosXHR<any>) => response.data,
      (): number => 0
    )
  );

  try {
    const responseA: any = await httpClientInstance.get(`https://cloud.segware.com.br/server/api/v1/6590/accounts/search?searchText=${ cs_id }&showAccessControlOnly=false&showDisableMonitoring=false&includeDisabled=false`);
    
    const responseB = await httpClientInstance.post(
      'https://api.segware.com.br/v1/serviceOrders',
      {
        accountId: responseA.data[0].id,
        defectId: '40807',
        description: descricao_problema,
        personExecutantId: 94899,
        requesterId: '80868'
      }
    );
    
    return {
      status: 200,
      data: {
        timestamp,
        status: true,
        statusCode: 200,
        method: req.method,
        path: req.originalUrl || req.url,
        query: req.query,
        headers: req.headers,
        body: req.body,
        data: responseB.data
      }
    };
  } catch (error: unknown) {
    console.log(`Service | Timestamp: ${ timestamp } | Name: createServiceOrderX1 | Error: ${ error instanceof Error ? error.message : String(error) }`);

    return {
      status: 500,
      data: {
        timestamp,
        status: false,
        statusCode: 500,
        method: req.method,
        path: req.originalUrl || req.url,
        query: req.query,
        headers: req.headers,
        body: req.body,
        message: 'Something went wrong.',
        suggestion: 'Please try again later. If this issue persists, contact our support team for assistance.'
      }
    };   
  }
};
