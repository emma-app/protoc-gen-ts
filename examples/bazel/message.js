import * as pb_1 from "google-protobuf";
export class Package extends pb_1.Message {
    constructor(data) {
        super();
        pb_1.Message.initialize(this, Array.isArray(data) ? data : [], 0, -1, [5], []);
        if (!Array.isArray(data) && typeof data == "object") {
            if ("name" in data) {
                this.name = data.name;
            }
            if ("author" in data) {
                this.author = data.author;
            }
            if ("release_date" in data) {
                this.release_date = data.release_date;
            }
            if ("vcs_url" in data) {
                this.vcs_url = data.vcs_url;
            }
            this.tags = data.tags;
        }
    }
    get name() {
        return pb_1.Message.getField(this, 1);
    }
    set name(value) {
        pb_1.Message.setField(this, 1, value);
    }
    get author() {
        return pb_1.Message.getField(this, 2);
    }
    set author(value) {
        pb_1.Message.setField(this, 2, value);
    }
    get release_date() {
        return pb_1.Message.getField(this, 3);
    }
    set release_date(value) {
        pb_1.Message.setField(this, 3, value);
    }
    get vcs_url() {
        return pb_1.Message.getField(this, 4);
    }
    set vcs_url(value) {
        pb_1.Message.setField(this, 4, value);
    }
    get tags() {
        return pb_1.Message.getField(this, 5);
    }
    set tags(value) {
        pb_1.Message.setField(this, 5, value);
    }
    toObject() {
        var data = {
            tags: this.tags
        };
        if (this.name != null) {
            data.name = this.name;
        }
        if (this.author != null) {
            data.author = this.author;
        }
        if (this.release_date != null) {
            data.release_date = this.release_date;
        }
        if (this.vcs_url != null) {
            data.vcs_url = this.vcs_url;
        }
        return data;
    }
    serialize(w) {
        const writer = w || new pb_1.BinaryWriter();
        if (typeof this.name === "string" && this.name.length)
            writer.writeString(1, this.name);
        if (typeof this.author === "string" && this.author.length)
            writer.writeString(2, this.author);
        if (typeof this.release_date === "string" && this.release_date.length)
            writer.writeString(3, this.release_date);
        if (typeof this.vcs_url === "string" && this.vcs_url.length)
            writer.writeString(4, this.vcs_url);
        if (this.tags !== undefined)
            writer.writeRepeatedString(5, this.tags);
        if (!w)
            return writer.getResultBuffer();
    }
    static deserialize(bytes) {
        const reader = bytes instanceof Uint8Array ? new pb_1.BinaryReader(bytes) : bytes, message = new Package();
        while (reader.nextField()) {
            if (reader.isEndGroup())
                break;
            switch (reader.getFieldNumber()) {
                case 1:
                    message.name = reader.readString();
                    break;
                case 2:
                    message.author = reader.readString();
                    break;
                case 3:
                    message.release_date = reader.readString();
                    break;
                case 4:
                    message.vcs_url = reader.readString();
                    break;
                case 5:
                    pb_1.Message.addToRepeatedField(message, 5, reader.readString());
                    break;
                default: reader.skipField();
            }
        }
        return message;
    }
    serializeBinary() {
        return this.serialize();
    }
    static deserializeBinary(bytes) {
        return Package.deserialize(bytes);
    }
}
