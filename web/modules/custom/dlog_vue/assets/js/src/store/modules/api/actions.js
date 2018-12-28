/**
 * Search for results in global index.
 */
let doSearchGlobal = (context, data) => {
  let options = {
    params: {
      _format: 'json',
      text: data,
    },
  };

  return Vue.http.get('/api/search/global', options)
    .then(
      response => {
        return response.body;
      },
      response => {
        console.log(response);
      });
};

export default {
  doSearchGlobal,
};
