package org.endeavourhealth.imviewer.api.publicendpoints;

import org.endeavourhealth.common.utility.MetricsHelper;
import org.endeavourhealth.common.utility.MetricsTimer;
import org.endeavourhealth.imviewer.common.dal.ViewerJDBCDAL;
import org.endeavourhealth.imviewer.common.models.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;
import java.util.List;

@Path("/Viewer")
public class ViewerEndpoint {
    private static final Logger LOG = LoggerFactory.getLogger(ViewerEndpoint.class);

    @POST
    @Path("/Authenticate")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response authenticate(@Context SecurityContext sc,
                                 UserCredentials userCredentials) throws Exception {
        try (MetricsTimer t = MetricsHelper.recordTime("Viewer.authenticate")) {
            LOG.debug("authenticate");

            UserDetails result = new ViewerJDBCDAL().authenticate(userCredentials.getUsername(), userCredentials.getPassword());

            if (result != null)
                return Response
                .ok()
                .entity(result)
                .build();
            else
                return Response
                    .status(Response.Status.UNAUTHORIZED)
                    .build();
        }
    }

    @POST
    @Path("/Register")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response register(@Context SecurityContext sc,
                                 UserRegistration userRegistration) throws Exception {
        try (MetricsTimer t = MetricsHelper.recordTime("Viewer.register")) {
            LOG.debug("register");

            UserDetails result = new ViewerJDBCDAL().register(userRegistration);

            if (result != null)
                return Response
                    .ok()
                    .entity(result)
                    .build();
            else
                return Response
                    .status(Response.Status.UNAUTHORIZED)
                    .build();
        }
    }

    @GET
    @Path("/Search")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response search(@Context SecurityContext sc,
                           @QueryParam("root") String root,
                           @QueryParam("term") String term,
                           @QueryParam("relationship") List<String> relationships,
                           @HeaderParam("authorization") String authString) throws Exception {
        try (MetricsTimer t = MetricsHelper.recordTime("Viewer.search")) {
            LOG.debug("search");

            ViewerJDBCDAL dal = new ViewerJDBCDAL();
            if (!dal.validate(authString))
                return Response.status(Response.Status.UNAUTHORIZED).build();

            List<Concept> result = dal.search(term, root, relationships);

            return Response
                .ok()
                .entity(result)
                .build();
        }
    }

    @GET
    @Path("/{iri}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getConcept(@Context SecurityContext sc,
                               @PathParam("iri") String iri,
                               @HeaderParam("authorization") String authString) throws Exception {
        try (MetricsTimer t = MetricsHelper.recordTime("Viewer.getConcept")) {
            LOG.debug("getConcept");

            ViewerJDBCDAL dal = new ViewerJDBCDAL();
            if (!dal.validate(authString))
                return Response.status(Response.Status.UNAUTHORIZED).build();

            Concept result = dal.getConcept(iri);

            return Response
                .ok()
                .entity(result)
                .build();
        }
    }

    @GET
    @Path("/{iri}/Tree")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTree(@Context SecurityContext sc,
                               @PathParam("iri") String iri,
                               @QueryParam("root") String root,
                               @QueryParam("relationship") List<String> relationships,
                            @HeaderParam("authorization") String authString) throws Exception {
        try (MetricsTimer t = MetricsHelper.recordTime("Viewer.getTargets")) {
            LOG.debug("getTargets");

            ViewerJDBCDAL dal = new ViewerJDBCDAL();
            if (!dal.validate(authString))
                return Response.status(Response.Status.UNAUTHORIZED).build();

            List<RelatedConcept> result = dal.getTree(iri, root, relationships);

            return Response
                .ok()
                .entity(result)
                .build();
        }
    }

    @GET
    @Path("/{iri}/Properties")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getProperties(@Context SecurityContext sc,
                               @PathParam("iri") String iri,
                                  @HeaderParam("authorization") String authString) throws Exception {
        try (MetricsTimer t = MetricsHelper.recordTime("Viewer.getProperties")) {
            LOG.debug("getProperties");

            ViewerJDBCDAL dal = new ViewerJDBCDAL();
            if (!dal.validate(authString))
                return Response.status(Response.Status.UNAUTHORIZED).build();

            List<Property> result = dal.getProperties(iri);

            return Response
                .ok()
                .entity(result)
                .build();
        }
    }

    @GET
    @Path("/{iri}/Definition")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getDefinition(@Context SecurityContext sc,
                               @PathParam("iri") String iri,
                                  @HeaderParam("authorization") String authString) throws Exception {
        try (MetricsTimer t = MetricsHelper.recordTime("Viewer.getDefinition")) {
            LOG.debug("getDefinition");

            ViewerJDBCDAL dal = new ViewerJDBCDAL();
            if (!dal.validate(authString))
                return Response.status(Response.Status.UNAUTHORIZED).build();

            List<RelatedConcept> result = dal.getDefinition(iri);

            return Response
                .ok()
                .entity(result)
                .build();
        }
    }

    @GET
    @Path("/{iri}/Sources")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSources(@Context SecurityContext sc,
                               @PathParam("iri") String iri,
                               @QueryParam("relationship") List<String> relationships,
                               @HeaderParam("authorization") String authString) throws Exception {
        try (MetricsTimer t = MetricsHelper.recordTime("Viewer.getSources")) {
            LOG.debug("getSources");

            ViewerJDBCDAL dal = new ViewerJDBCDAL();
            if (!dal.validate(authString))
                return Response.status(Response.Status.UNAUTHORIZED).build();

            List<RelatedConcept> result = dal.getSources(iri, relationships);

            return Response
                .ok()
                .entity(result)
                .build();
        }
    }
}
