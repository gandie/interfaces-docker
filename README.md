# Interfaces-docker - Interfaces project code running via docker

“Interfaces” will build the bridge between performing arts and computer art. Namely it will capture the dynamics and expression from dance and transport it into the world of code generated art.
“Interfaces” wants to trigger, push and moderate a dialog between generative artists and choreographers.
The end result – apart from the resulting artworks – will be a data- and knowledgebase loaded with workflow documentation, sample code, converters and scanners and other open source tools that aim to help creators to run their respective part of collaborations between dance and code art.
For a generative artist “Interfaces” will provide the dancer to perform in the parameter space of the code. For Choreographers “Interfaces” will open a new stage that has their audience in galleries and on the web.

- [YouTube Introduction](https://youtu.be/LNbGbG5nC9E?t=80)
- [Join us on Discord](https://discord.com/channels/1068875022220922900/1068875022220922902)

Further information regarding this project besides of the software part can be found here:

- [Interfaces Landing Page](http://interfaces.7pc.de/)

## Installation

For any questions regarding installation and setup feel free to visit our Discord ( link above ) and ask questions in the feedback area.

### Requirements

As this is a bundle of software wrapped into docker images, you need both `docker` and `docker-compose` to install and run this code. A Debian-based Linux distribution is the recommended OS for this, but any OS capable of running Docker should work. 

### Setup Docker environment - Scripted installation ( recommended )

After setting up the requirements, run the installation script:

```bash
./StartZopeCompose
```

This will call the corresponding `docker-compose` command, which will then download and build the images and set up and run the containers.

After that the webapp should be available on browser via:

```
http://localhost:80
```

As port 80 will bexposed on all available network interfaces, you're able to run the webapp from any other device living in the same network via IP-address.
