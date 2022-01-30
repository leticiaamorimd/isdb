require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./models/user");
const Genre = require("./models/genre");
const Artist = require("./models/artist");
const Track = require("./models/track");
const Album = require("./models/album");
const Media_Type = require("./models/media_Type");

const auth = require("./middleware/auth");

mongoose
  .connect("mongodb://localhost:27017/ismb", { useNewUrlParser: true })
  .then(() => {
    const express = require("express");
    var bodyParser = require("body-parser");
    const router = express.Router();
    const app = express();
    app.use(express.json());
    app.use("/", router);
    // configure the app to use bodyParser()
    app.use(
      bodyParser.urlencoded({
        extended: true,
      })
    );
    app.use(bodyParser.json());
    app.listen(5000, () => {
      console.log("Server has started!");
    });

    router.post("/register", async (req, res) => {
      try {
        if (
          req.body.userName &&
          req.body.userName.trim() !== "" &&
          req.body.password &&
          req.body.password.trim() !== ""
        ) {
          encryptedPassword = await bcrypt.hash(req.body.password, 10);
          const user = new User({
            userName: req.body.userName,
            password: encryptedPassword,
          });
          await user.save();
          res.status(200);
          res.send({ success: "User is registered successfully!" });
        } else {
          res.status(400);
          res.send({ error: "Missing required details!" });
        }
      } catch (e){
        console.log(e);
        res.status(400);
        res.send({ error: "Invalid Request!" });
      }
    });
    

    router.post("/login", async (req, res) => {
      try {
        const user = await User.findOne({ userName: req.body.userName });
        if (user && (await bcrypt.compare(req.body.password, user.password))) {
          // Create token
          const userName=req.body.userName;
          const token = jwt.sign(
            { user_id: user._id, userName:userName},
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          user.token = token;
          user.password="";
          res.send(user);
        } else {
          res.status(404);
          res.send({ error: "User doesn't exist!" });
        }
      } catch (e) {
        console.log(e);
        res.status(404);
        res.send({ error: "User doesn't exist!" });
      }
    });

    router.get("/tracks/:id", auth,async (req, res) => {
      var options = {
        allowDiskUse: false,
      };

      var pipeline = [
        {
          $match: {
            TrackId: req.params.id + "",
          },
        },
        {
          $lookup: {
            from: "genres",
            localField: "GenreId",
            foreignField: "GenreId",
            as: "Genre",
          },
        },
        {
          $lookup: {
            from: "albums",
            localField: "AlbumId",
            foreignField: "AlbumId",
            pipeline: [
              {
                $lookup: {
                  from: "artists",
                  localField: "ArtistId",
                  foreignField: "ArtistId",
                  as: "Artists",
                },
              },
              {
                $project: {
                  _id: "$_id",
                  AlbumId: "$AlbumId",
                  Title: "$Title",
                  artists: "$Artists",
                },
              },
            ],
            as: "Album",
          },
        },
        {
          $lookup: {
            from: "media_types",
            localField: "MediaTypeId",
            foreignField: "MediaTypeId",
            as: "MediaType",
          },
        },
        {
          $project: {
            _id: "$_id",
            album: "$Album",
            genre: "$Genre",
            mediaType: "$MediaType",
            Name: "$Name",
            Composer: "$Composer",
            MilliSeconds: "$Milliseconds",
            Bytes: "$Bytes",
            UniPrice: "$UnitPrice",
          },
        },
      ];

      try {
        const track = await Track.aggregate(pipeline, options);
        if (track) {
          res.send(track);
        } else {
          res.status(404);
          res.send({ error: "Track doesn't exist!" });
        }
      } catch {
        res.status(404);
        res.send({ error: "Track doesn't exist!" });
      }
    });

    router.get("/genres", auth,async (req, res) => {
      var options = {
        allowDiskUse: true,
      };

      var pipeline = [
        {
          $lookup: {
            from: "tracks",
            localField: "GenreId",
            foreignField: "GenreId",
            as: "Tracks",
            pipeline: [
              {
                $lookup: {
                  from: "media_types",
                  localField: "MediaTypeId",
                  foreignField: "MediaTypeId",
                  as: "MediaType",
                },
              },
              {
                $lookup: {
                  from: "albums",
                  localField: "AlbumId",
                  foreignField: "AlbumId",
                  as: "Album",
                  pipeline: [
                    {
                      $lookup: {
                        from: "artists",
                        localField: "ArtistId",
                        foreignField: "ArtistId",
                        as: "Artists",
                      },
                    },
                    {
                      $project: {
                        _id: "$_id",
                        AlbumId: "$AlbumId",
                        Title: "$Title",
                        artists: "$Artists",
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: "$_id",
                  album: "$Album",
                  mediaType: "$MediaType",
                  Name: "$Name",
                  Composer: "$Composer",
                  MilliSeconds: "$Milliseconds",
                  Bytes: "$Bytes",
                  UniPrice: "$UnitPrice",
                },
              },
            ],
          },
        },
      ];

      try {
        const genres = await Genre.aggregate(pipeline, options);
        if (genres) {
          res.send(genres);
        } else {
          res.status(200);
          res.send({ error: "Genres doesn't exist!" });
        }
      } catch {
        res.status(404);
        res.send({ error: "Genres doesn't exist!" });
      }
    });

    router.get("/albums/:id",auth, async (req, res) => {
      var options = {
        allowDiskUse: false,
      };

      var pipeline = [
        {
          $match: {
            AlbumId: req.params.id + "",
          },
        },
        {
          $lookup: {
            from: "tracks",
            localField: "AlbumId",
            foreignField: "AlbumId",
            as: "Tracks",
            pipeline: [
              {
                $lookup: {
                  from: "media_types",
                  localField: "MediaTypeId",
                  foreignField: "MediaTypeId",
                  as: "MediaType",
                },
              },
              {
                $lookup: {
                  from: "genres",
                  localField: "GenreId",
                  foreignField: "GenreId",
                  as: "Genre",
                },
              },
              {
                $project: {
                  _id: "$_id",
                  genre: "$Genre",
                  mediaType: "$MediaType",
                  Name: "$Name",
                  Composer: "$Composer",
                  MilliSeconds: "$Milliseconds",
                  Bytes: "$Bytes",
                  UniPrice: "$UnitPrice",
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "artists",
            localField: "ArtistId",
            foreignField: "ArtistId",
            as: "Artists",
          },
        },
        {
          $project: {
            _id: "$_id",
            tracks: "$Tracks",
            artists: "$Artists",
            AlbumId: "$AlbumId",
            Title: "$Title",
          },
        },
      ];
      try {
        const album = await Album.aggregate(pipeline, options);
        if (album) {
          res.send(album);
        } else {
          res.status(404);
          res.send({ error: "Album doesn't exist!" });
        }
      } catch {
        res.status(404);
        res.send({ error: "Album doesn't exist!" });
      }
    });

    router.get("/artists/:id",auth, async (req, res) => {
      var options = {
        allowDiskUse: false,
      };
      var pipeline = [
        {
          $match: {
            ArtistId: req.params.id + "",
          },
        },
        {
          $lookup: {
            from: "albums",
            localField: "ArtistId",
            foreignField: "ArtistId",
            as: "albums",
            pipeline: [
              {
                $lookup: {
                  from: "tracks",
                  localField: "AlbumId",
                  foreignField: "AlbumId",
                  as: "Tracks",
                  pipeline: [
                    {
                      $lookup: {
                        from: "media_types",
                        localField: "MediaTypeId",
                        foreignField: "MediaTypeId",
                        as: "MediaType",
                      },
                    },
                    {
                      $lookup: {
                        from: "genres",
                        localField: "GenreId",
                        foreignField: "GenreId",
                        as: "Genre",
                      },
                    },
                    {
                      $project: {
                        _id: "$_id",
                        genre: "$Genre",
                        mediaType: "$MediaType",
                        Name: "$Name",
                        Composer: "$Composer",
                        MilliSeconds: "$Milliseconds",
                        Bytes: "$Bytes",
                        UniPrice: "$UnitPrice",
                      },
                    },
                  ],
                },
              },
              {
                $project: {
                  _id: "$_id",
                  AlbumId: "$AlbumId",
                  Title: "$Title",
                  tracks: "$Tracks",
                },
              },
            ],
          },
        },
      ];

      try {
        const artist = await Artist.aggregate(pipeline, options);
        if (artist) {
          res.send(artist);
        } else {
          res.status(404);
          res.send({ error: "Artist doesn't exist!" });
        }
      } catch {
        res.status(404);
        res.send({ error: "Artist doesn't exist!" });
      }
    });

    router.post("/tracks",auth, async (req, res) => {
      var name = req.body.name;
      var albumId = req.body.albumId;
      var trackId = req.body.trackId;
      var genreId = req.body.genreId;
      var mediaTypeId = req.body.mediaTypeId;
      var composer = req.body.composer;
      var duration = req.body.duration;
      var byte = req.body.byte;
      var price = req.body.price;
      if (
        name &&
        name.trim() != "" &&
        composer &&
        composer.trim() != "" &&
        duration > 0 &&
        byte > 0 &&
        price > 0
      ) {
        const track1 = await Track.findOne({ TrackId: trackId + "" });
        const album = await User.findOne({ AlbumId: albumId + "" });
        const genre = await Genre.findOne({ GenreId: genreId + "" });
        const mediaType = await Media_Type.findOne({"MediaTypeId": mediaTypeId + ""});
        if (track1==null && album && genre && mediaType) {
          const track = new Track({
            TrackId: trackId,
            Name: name,
            AlbumId: albumId,
            GenreId: genreId,
            MediaTypeId: mediaTypeId,
            Composer: composer,
            MilliSeconds: duration,
            Bytes: byte,
            UniPrice: price,
          });
          await track.save();
          res.status(200);
          res.send({ success: "Track is added successfully!" });
        } else {
          res.status(200);
          res.send({ error: "Album or Genre or Media Type does not exist!" });
        }
      } else {
        res.status(400);
        res.send({ error: "Missing required details!" });
      }
    });
  });
