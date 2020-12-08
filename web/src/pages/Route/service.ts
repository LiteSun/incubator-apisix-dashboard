/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { request } from 'umi';
import { pickBy, identity } from 'lodash';

import {
  transformStepData,
  transformRouteData,
  transformUpstreamNodes,
  transformLabelList,
} from './transform';

export const create = (data: RouteModule.RequestData) =>
  request(`/routes`, {
    method: 'POST',
    data: transformStepData(data),
  });

export const update = (rid: number, data: RouteModule.RequestData) =>
  request(`/routes/${rid}`, {
    method: 'PUT',
    data: transformStepData(data),
  });

export const fetchItem = (rid: number) =>
  request(`/routes/${rid}`).then((data) => transformRouteData(data.data));

export const fetchList = ({ current = 1, pageSize = 10, ...res }) => {
  const { labels } = res;
  return request<Res<ResListData<RouteModule.ResponseBody>>>('/routes', {
    params: {
      name: res.name,
      uri: res.uri,
      label: (labels || []).join('&'),
      page: current,
      page_size: pageSize,
    },
  }).then(({ data }) => {
    // ! line 49-57 just for development, omit it when api ready
    const rows = data.rows.map((item) => {
      return {
        labels: {
          build: '16',
          env: 'production',
          version: 'v2',
        },
        ...item,
      };
    });
    return {
      data: rows,
      total: data.total_size,
    };
  });
};

export const remove = (rid: string) => request(`/routes/${rid}`, { method: 'DELETE' });

export const checkUniqueName = (name = '', exclude = '') =>
  request('/notexist/routes', {
    params: pickBy(
      {
        name,
        exclude,
      },
      identity,
    ),
  });

export const fetchUpstreamList = () => {
  return request<Res<ResListData<UpstreamModule.RequestBody>>>('/upstreams').then(({ data }) => ({
    data: data.rows,
    total: data.total_size,
  }));
};

export const fetchUpstreamItem = (sid: string) => {
  return request(`/upstreams/${sid}`).then(({ nodes, timeout, id }) => {
    return {
      upstreamHostList: transformUpstreamNodes(nodes),
      timeout,
      upstream_id: id,
    };
  });
};

export const checkHostWithSSL = (hosts: string[]) =>
  request('/check_ssl_exists', {
    method: 'POST',
    data: hosts,
  });

export const fetchLabelList = () => {
  // ! omit it when api ready
  return new Promise((resolve) => {
    const mockData: RouteModule.ResponseLabelList = [
      { build: '16' },
      { env: 'production' },
      { version: 'v2' },
      { version: 'v1' },
    ];
    resolve(transformLabelList(mockData));
  });
};
