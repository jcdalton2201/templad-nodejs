FROM node:22

WORKDIR /templad-bff
RUN mkdir -p /templad-bff/logs && chmod 775 -R /templad-bff
COPY ./app/ /templad-bff/app/
COPY package.json /templad-bff/package.json
COPY log4js.config.json /templad-bff/log4js.config.json
COPY ./node_modules/ /templad-bff/node_modules/
RUN chmod 777 -R /templad-bff/logs

EXPOSE 8080
EXPOSE 8085
# ENTRYPOINT ["npm", "run", "start"]
CMD [ "/bin/sh" ]